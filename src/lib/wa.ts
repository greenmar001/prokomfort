import "server-only";

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
  return waGet<any>("/categories", { revalidate: 3600 });
}

export async function getProduct(id: number) {
  return waGet<any>(`/product/${id}`, { revalidate: 300 });
}

export async function getCategoryProducts(categoryId: number, offset = 0, limit = 24) {
  const url = withQuery(`/category/${categoryId}/products`, {
    offset,
    limit,
    with: "images,skus",
  });
  return waGet<any>(url, { revalidate: 60 });
}
