import "server-only";
import { Category, ProductLike } from "@/types";

const BASE_RAW = process.env.WA_HEADLESS_BASE_URL;
if (!BASE_RAW) throw new Error("WA_HEADLESS_BASE_URL is not set");

// важно: для URL-конкатенации BASE должен заканчиваться на /
const BASE = BASE_RAW.endsWith("/") ? BASE_RAW : `${BASE_RAW}/`;

type Opts = { revalidate?: number };

function toUrl(path: string) {
  // важно: path должен быть БЕЗ ведущего /
  const clean = path.replace(/^\/+/, "");
  return new URL(clean, BASE).toString();
}

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const u = new URL(toUrl(path));
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function waGet<T>(pathOrUrl: string, opts: Opts = {}): Promise<T> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : toUrl(pathOrUrl);

  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: opts.revalidate ?? 300 },
    redirect: "follow",
  });

  const contentType = res.headers.get("content-type") || "";
  const bodyText = await res.text();

  if (!res.ok) throw new Error(`WA ${res.status}: ${bodyText.slice(0, 400)}`);
  if (!contentType.includes("application/json")) {
    throw new Error(
      `WA: expected JSON but got ${contentType || "unknown"} from ${url}. First bytes: ${bodyText.slice(0, 400)}`
    );
  }

  return JSON.parse(bodyText) as T;
}

export async function getCategories() {
  // Supports both array response and object wrapper
  return waGet<{ categories: Category[] } | Category[]>("/categories", { revalidate: 3600 });
}

export async function getProduct(idOrSlug: number | string): Promise<ProductLike> {
  // If it's a number, just fetch by ID
  if (typeof idOrSlug === "number" || /^\d+$/.test(String(idOrSlug))) {
    return waGet<ProductLike>(`/product/${idOrSlug}`, { revalidate: 300 });
  }

  // If it's a slug, try fetching directly first (some APIs support this)
  try {
    return await waGet<ProductLike>(`/product/${idOrSlug}`, { revalidate: 300 });
  } catch (e) {
    // If direct fetch fails, try searching by slug
    // Note: This relies on the search endpoint indexing the slug/url
    // console.warn(`Direct fetch for slug "${idOrSlug}" failed, trying search...`);

    try {
      // Cleaning slug: "some-product-name" -> "some product name"
      const query = String(idOrSlug).replace(/[-_]/g, " ").replace(".html", "");

      const searchRes = await waGet<{ products: ProductLike[] }>(withQuery("/products/search", { query }), { revalidate: 60 });
      const products = searchRes.products || [];

      // 1. Try exact URL match
      const exact = products.find(p =>
        p.url === idOrSlug ||
        p.frontend_url?.endsWith(`/${idOrSlug}`) ||
        p.frontend_url === idOrSlug
      );
      if (exact) return exact;

      // 2. Try looser URL match (if slug is part of url)
      const looseUrl = products.find(p => p.url?.includes(String(idOrSlug)) || p.frontend_url?.includes(String(idOrSlug)));
      if (looseUrl) return looseUrl;

      // 3. Fallback: Return first result if any
      if (products.length > 0) {
        console.warn(`Loose match for slug "${idOrSlug}" -> ID ${products[0].id}`);
        return products[0];
      }
    } catch (searchErr) {
      console.error("Search fallback failed", searchErr);
    }

    throw e; // Re-throw original error if search fails
  }
}

export async function getCategoryProducts(
  categoryId: number,
  offset = 0,
  limit = 24,
  sort?: string,
  order?: string
) {
  const params: Record<string, string | number | undefined> = {
    offset,
    limit,
    with: "images,skus,frontend_url",
  };
  if (sort) params.sort = sort;
  if (order) params.order = order;

  const url = withQuery(`/category/${categoryId}/products`, params);
  return waGet<{ products: ProductLike[]; count: number }>(url, { revalidate: 60 });
}
