import Link from "next/link";
// import Breadcrumbs from "@/components/Breadcrumbs";
import { getCategoryProducts } from "@/lib/wa";
import ProductCard from "@/components/ProductCard";
import { ProductLike } from "@/types";
export const revalidate = 60;

// Helper functions removed as they were unsued or can be replaced by direct access if needed, 
// although `pickImage` and `pickPrice` were marked unused.
// If they were used in map, we should use ProductLike type.
// But wait, the errors said: 
// 'Breadcrumbs' is defined but never used
// 'getCategoryProducts' is defined but never used
// 'getProduct' is defined but never used
// 'pickImage' is defined but never used
// 'pickPrice' is defined but never used
// So we just remove them.

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { page?: string };
}) {
  const { id } = await params;
  const pParam = (await searchParams)?.page;
  const page = Math.max(1, Number(pParam ?? "1"));
  const limit = 24;

  /*
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const res = await fetch(`${base}/api/catalog/category/${params.id}?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });

  const data = await res.json();
  */

  let products: ProductLike[] = [];
  let count = 0;
  let error: unknown = null;

  try {
    // Use direct logic to avoid "fetch from self" issues during SSR/ISR which can cause 500s or timeouts
    const data = await getCategoryProducts(Number(id), (page - 1) * limit, limit);
    products = data.products ?? [];
    count = Number(data.count ?? 0);
  } catch (e) {
    error = e;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <div style={{ padding: 40, color: "red" }}>
        <h2>Ошибка при загрузке категории</h2>
        <pre>{errorMessage}</pre>
        <p>Пожалуйста, проверьте консоль сервера или сообщите об этом администратору.</p>
        <details>
          <summary>Details</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    );
  }

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
        {products.map((p: ProductLike) => (
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
