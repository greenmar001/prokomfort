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
      if (res.status === 404) {
        console.error(`[waGet] 404 Not Found: ${url}`);
        throw new Error("Not Found");
      }
      throw new Error(`API Error: ${res.status} ${res.statusText} for ${url}`);
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

export function flattenCategories(categories: Category[], parentPath: string = ""): Category[] {
  let flat: Category[] = [];
  for (const cat of categories) {
    // Construct full_url from hierarchy to ensure it matches the routing structure
    const slugSegment = cat.url || String(cat.id);
    const currentPath = parentPath ? `${parentPath}/${slugSegment}` : slugSegment;

    // Override/Set full_url to be consistent with our recursive path
    cat.full_url = currentPath;

    flat.push(cat);
    if (cat.categories && cat.categories.length > 0) {
      flat = flat.concat(flattenCategories(cat.categories, currentPath));
    }
  }
  return flat;
}

export async function getCategoryProducts(
  categoryId: number,
  params: { page?: number; limit?: number; sort?: string; order?: string;[key: string]: string | number | undefined } = {}
) {
  const query = {
    limit: params.limit || 24,
    page: params.page || 1,
    sort: params.sort,
    order: params.order,
    // Add extra params for images/skus if needed. Standard endpoint might include them.
    // OpenAPI v1 says default fields. 
    with: "images,skus,frontend_url"
  };

  return waGet<{ products: ProductLike[]; count: number }>(withQuery(`/category/${categoryId}/products`, query), { revalidate: 60 });
}

// --- Product ---

// --- Product ---

function findExact(products: ProductLike[], target: string): ProductLike | undefined {
  // Normalize target: remove leading/trailing slashes, lowercase
  const normTarget = target.toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "");

  return products.find(p => {
    const normUrl = (p.url || "").toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "");
    const normFrontend = (p.frontend_url || "").toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "");

    // 1. Direct match on 'url' field (e.g. "product-name" === "product-name")
    if (normUrl === normTarget) return true;

    // 2. Direct match on 'frontend_url' (e.g. "category/product-name" === "category/product-name")
    if (normFrontend === normTarget) return true;

    // 3. Match suffix of frontend_url (e.g. target "product-name" matches "category/product-name")
    // Ensure we match a full segment path (preceded by slash)
    if (normFrontend.endsWith("/" + normTarget)) return true;

    return false;
  });
}

export async function getProduct(idOrSlug: number | string): Promise<ProductLike> {
  // If it's a number, just fetch by ID
  if (typeof idOrSlug === "number" || /^\d+$/.test(String(idOrSlug))) {
    return waGet<ProductLike>(`/product/${idOrSlug}`, { revalidate: 300 });
  }

  // If it's a slug, try fetching directly first
  try {
    return await waGet<ProductLike>(`/product/${idOrSlug}`, { revalidate: 300 });
  } catch (e) {
    console.warn(`[getProduct] Direct fetch failed for "${idOrSlug}". API might require ID. Trying search fallback...`);
    try {
      const targetSlug = String(idOrSlug);

      // Strategy 1: Full fuzzy search (all words)
      // Replace slashes with spaces to support full path searching "cat/sub/prod" -> "cat sub prod"
      const queryFull = targetSlug.replace(/[-_/]/g, " ").replace(".html", "");
      const resFull = await waGet<{ products: ProductLike[] }>(withQuery("/products/search", { query: queryFull, with: "images,skus,frontend_url" }), { revalidate: 60 });
      const productsFull = resFull.products || [];
      console.log(`[getProduct] Strategy 1 (Full) for "${idOrSlug}" found ${productsFull.length} items.`);

      const match1 = findExact(productsFull, targetSlug);
      if (match1) {
        console.log(`[getProduct] Match found via Strategy 1: ${match1.id}`);
        return match1;
      }

      // Strategy 2: Search by last 2 parts (Model/SKU usually at end and preserved in Latin)
      let productsLast: ProductLike[] = [];
      const parts = targetSlug.split(/[-/]/).filter(p => p.length > 0 && p !== "html");
      if (parts.length >= 2) {
        const queryLast = parts.slice(-2).join(" ");
        // Avoid repeating query if same
        if (queryLast !== queryFull) {
          const resLast = await waGet<{ products: ProductLike[] }>(withQuery("/products/search", { query: queryLast, with: "images,skus,frontend_url" }), { revalidate: 60 });
          productsLast = resLast.products || [];
          console.log(`[getProduct] Strategy 2 (Last 2) queries "${queryLast}" found ${productsLast.length} items.`);

          const match2 = findExact(productsLast, targetSlug);
          if (match2) {
            console.log(`[getProduct] Match found via Strategy 2: ${match2.id}`);
            return match2;
          }
        }
      }

      // REMOVED SAFEGUARDS: Strategy 3 and Blind Fallbacks removed to prevent "Random Product" issues.
      // If we don't have an exact match on URL/FrontendURL, we return 404.

    } catch (searchErr) {
      console.error("Search fallback failed", searchErr);
    }

    console.error(`[getProduct] All strategies failed for "${idOrSlug}".`);
    throw new Error("Not Found");
  }
}
