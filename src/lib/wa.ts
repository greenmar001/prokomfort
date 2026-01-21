import "server-only";
import { Category, ProductLike } from "@/types";

const WA_BASE_URL = process.env.WA_HEADLESS_BASE_URL;

if (!WA_BASE_URL) {
  throw new Error("WA_HEADLESS_BASE_URL is not set");
}

const headers = {
  "Content-Type": "application/json",
  "WA-Headless-APIVer": "1.0",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
};

/**
 * Generic Fetch Wrapper
 */
async function waGet<T>(endpoint: string, options: RequestInit & { revalidate?: number } = {}): Promise<T> {
  // Normalize base URL by removing trailing slash
  const base = WA_BASE_URL!.replace(/\/$/, "");
  // Normalize endpoint by ensuring leading slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
      next: { revalidate: options.revalidate ?? 300 }
    });

    if (!res.ok) {
      if (res.status === 404) throw new Error("Not Found");
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== "") searchParams.append(key, String(val));
  });
  const qs = searchParams.toString();
  return qs ? `${path}?${qs}` : path;
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await waGet<{ categories: Category[] }>("/categories?tree=1", { revalidate: 300 });
    return data.categories || [];
  } catch {
    return [];
  }
}

export async function getCategoryProducts(
  categoryId: number,
  params: { page?: number; limit?: number; sort?: string; order?: string;[key: string]: string | number | undefined } = {}
) {
  const query = {
    category_id: categoryId,
    limit: params.limit || 24,
    page: params.page || 1,
    sort: params.sort,
    order: params.order,
    // Add extra params for images/skus if needed. Standard endpoint might include them.
    // OpenAPI v1 says default fields. 
    with: "images,skus,frontend_url"
  };

  return waGet<{ products: ProductLike[]; count: number }>(withQuery("/products", query), { revalidate: 60 });
}

// --- Product ---

function findExact(products: ProductLike[], target: string): ProductLike | undefined {
  // Check exact url, frontend_url, or if frontend_url ends with target
  return products.find(p => {
    if (p.url === target) return true;
    if (p.frontend_url === target) return true;
    // p.frontend_url usually is like "category/subcategory/product-name"
    // target might be "product-name" or "category/subcategory/product-name"
    if (p.frontend_url && String(target).indexOf('/') === -1 && p.frontend_url.endsWith(`/${target}`)) return true;
    return false;
  });
}

export async function getProduct(idOrSlug: number | string): Promise<ProductLike> {
  // If it's a number, just fetch by ID
  if (typeof idOrSlug === "number" || /^\\d+$/.test(String(idOrSlug))) {
    return waGet<ProductLike>(`/product/${idOrSlug}`, { revalidate: 300 });
  }

  // If it's a slug, try fetching directly first
  try {
    return await waGet<ProductLike>(`/product/${idOrSlug}`, { revalidate: 300 });
  } catch (e) {
    // console.warn(`Direct fetch for slug "${idOrSlug}" failed, trying search...`);
    try {
      const targetSlug = String(idOrSlug);

      // Strategy 1: Full fuzzy search (all words)
      // Replace slashes with spaces to support full path searching "cat/sub/prod" -> "cat sub prod"
      const queryFull = targetSlug.replace(/[-_/]/g, " ").replace(".html", "");
      const resFull = await waGet<{ products: ProductLike[] }>(withQuery("/products/search", { query: queryFull }), { revalidate: 60 });
      const productsFull = resFull.products || [];

      const match1 = findExact(productsFull, targetSlug);
      if (match1) return match1;

      // Strategy 2: Search by last 2 parts (Model/SKU usually at end and preserved in Latin)
      // e.g. "elektricheskiy-kamin-electrolux-efpw-2000s" -> "efpw 2000s"
      // Also handle paths: "cat/sub/prod" -> "sub prod"
      const parts = targetSlug.split(/[-/]/).filter(p => p.length > 0 && p !== "html");
      if (parts.length >= 2) {
        const queryLast = parts.slice(-2).join(" ");
        // Avoid repeating query if same
        if (queryLast !== queryFull) {
          const resLast = await waGet<{ products: ProductLike[] }>(withQuery("/products/search", { query: queryLast }), { revalidate: 60 });
          const productsLast = resLast.products || [];

          const match2 = findExact(productsLast, targetSlug);
          if (match2) return match2;
        }
      }

      // Fallback: If we found SOMETHING in full search, return it? 
      // User reported 404, but if we trust detailed search query, first result often correct.
      if (productsFull.length > 0) {
        // console.warn(`Loose match for slug "${idOrSlug}" -> ID ${productsFull[0].id}`);
        return productsFull[0];
      }
    } catch (searchErr) {
      console.error("Search fallback failed", searchErr);
    }

    throw e; // Re-throw original error if search fails
  }
}
