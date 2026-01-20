import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getProduct } from "@/lib/wa";
import { stripWaVars, firstSku, firstImage } from "@/lib/format";
import { ProductLike } from "@/types";

export const revalidate = 300;
// Removed local helper functions in favor of shared ones in lib/format

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p: ProductLike = await getProduct(Number(id));

  const sku = firstSku(p);
  const img = firstImage(p);

  return (
    <>
      <Breadcrumbs items={[{ title: "Категории", href: "/" }, { title: p.name ?? `Товар #${id}` }]} />

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 10 }}>
        <Link href="/" className="btn">← Назад</Link>
        <div className="muted">ID: {p.id}</div>
      </div>

      <h1 className="h1">{p.name ?? `Товар #${id}`}</h1>
      {p.summary ? <div className="muted" style={{ marginBottom: 14 }}>{p.summary}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 14, alignItems: "start" }}>
        <div className="card">
          <div className="thumb" style={{ aspectRatio: "16/9" }}>
            {img?.url_big ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url_big} alt={p.name ?? ""} />
            ) : (
              <span>Нет фото</span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}>Цена</div>
          <div className="price" style={{ fontSize: 22 }}>
            {sku?.price_str ?? "—"}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="badge">{sku?.available ? "В наличии" : "Под заказ"}</span>
            <span className="badge">SKU: {p.sku_id}</span>
          </div>

          <button className="btn" style={{ marginTop: 14 }} disabled
            title="Следующий этап — подключаем корзину Headless API">
            Добавить в корзину (следующий этап)
          </button>
        </div>
      </div>

      {p.description ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Описание</div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: stripWaVars(p.description) }} />
        </div>
      ) : null}
    </>
  );
}
