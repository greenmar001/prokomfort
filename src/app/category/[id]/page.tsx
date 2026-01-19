import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCategoryProducts, getProduct } from "@/lib/wa";
import ProductCard from "@/components/ProductCard";
export const revalidate = 60;

function pickImage(p: any) {
  const im = Array.isArray(p?.images) && p.images.length ? p.images[0] : null;
  return im?.url_thumb || im?.url_crop || im?.url_big || null;
}
function pickPrice(p: any) {
  const sku = Array.isArray(p?.skus) && p.skus.length ? p.skus[0] : null;
  return sku?.price_str || sku?.price_html || null;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? "1"));
  const limit = 24;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const res = await fetch(`${base}/api/catalog/category/${params.id}?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });

  const data = await res.json();
  const products = data.products ?? [];
  const count = Number(data.count ?? 0);

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  // чтобы не показывать 200 страниц — делаем окно вокруг текущей
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <main style={{ padding: 24 }}>
      <div className="grid">
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {prevPage ? (
          <Link className="btn" href={`/category/${params.id}?page=${prevPage}`}>
            ← Назад
          </Link>
        ) : (
          <span className="btn" style={{ opacity: 0.5, pointerEvents: "none" }}>
            ← Назад
          </span>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {start > 1 ? <span>…</span> : null}
          {pages.map((p) => (
            <Link
              key={p}
              className="btn"
              href={`/category/${params.id}?page=${p}`}
              style={p === page ? { fontWeight: 700, textDecoration: "underline" } : undefined}
            >
              {p}
            </Link>
          ))}
          {end < totalPages ? <span>…</span> : null}
        </div>

        {nextPage ? (
          <Link className="btn" href={`/category/${params.id}?page=${nextPage}`}>
            Вперёд →
          </Link>
        ) : (
          <span className="btn" style={{ opacity: 0.5, pointerEvents: "none" }}>
            Вперёд →
          </span>
        )}

        <span style={{ marginLeft: "auto", opacity: 0.75 }}>
          Страница {page} из {totalPages} (всего {count})
        </span>
      </div>
    </main>
  );
}
