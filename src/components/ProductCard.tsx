import Link from "next/link";

type Image = {
  url_thumb?: string;
  url_crop?: string;
  url_big?: string;
};

type Sku = {
  price_str?: string;
  available?: number | boolean;
};

export type ProductLike = {
  id: number;
  name?: string;
  summary?: string;
  images?: Image[];
  skus?: Sku[];
};

function waImageUrl(productId: number, imageId: number, ext: string, size: "200x0" | "96x96" | "970") {
  const a = String(productId % 100).padStart(2, "0");           // last 2
  const b = String(Math.floor(productId / 100) % 100).padStart(2, "0"); // prev 2
  return `https://pro-komfort.com/wa-data/public/shop/products/${a}/${b}/${productId}/images/${imageId}/${imageId}.${size}.${ext}`;
}

function pickImg(p: any): string | null {
  // 1) если API уже дал images[]
  const im = p.images?.[0];
  const fromImages = im?.url_thumb || im?.url_crop || im?.url_big;
  if (fromImages) return fromImages;

  // 2) если пришло только image_id/ext (как в category/products)
  const imageId = p.image_id;
  const ext = p.ext;
  if (imageId && ext && p.id) {
    return waImageUrl(Number(p.id), Number(imageId), String(ext).replace(".", ""), "200x0");
  }

  return null;
}

function pickPrice(p: ProductLike): string {
  const sku = p.skus?.[0];
  return sku?.price_str || "—";
}

function isAvailable(p: ProductLike): boolean | null {
  const sku = p.skus?.[0];
  if (sku?.available === undefined || sku?.available === null) return null;
  return Boolean(sku.available);
}

export default function ProductCard({ product }: { product: ProductLike }) {
  const img = pickImg(product);
  const price = pickPrice(product);
  const avail = isAvailable(product);

  return (
    <div className="card">
      <Link href={`/product/${product.id}`} className="card-link" aria-label={product.name ?? `Товар ${product.id}`}>
        <div className="thumb">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.name ?? ""} loading="lazy" />
          ) : (
            <span>Нет фото</span>
          )}
        </div>

        <div className="title">{product.name ?? `Товар #${product.id}`}</div>

        {product.summary ? (
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.35, maxHeight: 36, overflow: "hidden" }}>
            {product.summary}
          </div>
        ) : null}
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="price">{price}</div>
        {avail === null ? (
          <span className="badge">—</span>
        ) : avail ? (
          <span className="badge">В наличии</span>
        ) : (
          <span className="badge">Под заказ</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Link href={`/product/${product.id}`} className="btn" style={{ flex: 1, textAlign: "center" }}>
          Подробнее
        </Link>
        <button className="btn" style={{ width: 120 }} disabled title="Подключим корзину на следующем этапе">
          В корзину
        </button>
      </div>
    </div>
  );
}
