import Link from "next/link";
import Image from "next/image";
import { ProductLike } from "@/types";
import { Heart, BarChart3, Star, MessageCircle, ShoppingCart } from "lucide-react";

function waImageUrl(productId: number, imageId: number, ext: string, size: "200x0" | "96x96" | "970" | "500x0") {
  const a = String(productId % 100).padStart(2, "0");
  const b = String(Math.floor(productId / 100) % 100).padStart(2, "0");
  return `https://pro-komfort.com/wa-data/public/shop/products/${a}/${b}/${productId}/images/${imageId}/${imageId}.${size}.${ext}`;
}

function pickImg(p: ProductLike): string | null {
  const im = p.images?.[0];
  // Prefer bigger images for better quality
  const fromImages = im?.url_big || im?.url_crop || im?.url_thumb;
  if (fromImages) return fromImages;

  const imageId = p.image_id;
  const ext = p.ext;
  if (imageId && ext && p.id) {
    // Fallback to "500x0" (medium-large) - better than 200x0 but lighter than 970
    return waImageUrl(Number(p.id), Number(imageId), String(ext).replace(".", ""), "500x0");
  }
  return null;
}

function pickPrice(p: ProductLike): { price: string; oldPrice?: string; discount?: number } {
  const sku = p.skus?.[0];
  const priceVal = parseFloat(sku?.price_str?.replace(/[^\d.]/g, "") || "0");
  const comparePriceVal = sku?.compare_price ? parseFloat(String(sku.compare_price)) : 0; // Assuming compare_price might exist in data

  // Clean price string for display
  const cleanPrice = sku?.price_str ? sku.price_str.replace(".00", "").replace(" руб.", " ₽") : "—";

  let oldPriceDisplay: string | undefined;
  let discount: number | undefined;

  if (comparePriceVal > priceVal) {
    oldPriceDisplay = comparePriceVal.toLocaleString("ru-RU") + " ₽";
    discount = Math.round(((comparePriceVal - priceVal) / comparePriceVal) * 100);
  }

  return { price: cleanPrice, oldPrice: oldPriceDisplay, discount };
}

function isAvailable(p: ProductLike): boolean | null {
  const sku = p.skus?.[0];
  if (sku?.available === undefined || sku?.available === null) return null;
  return Boolean(sku.available);
}

// Mock features for visualization matching the screenshot
const MOCK_FEATURES = [
  { label: "Мощность (BTU)", value: "12 (до 40 м²)" },
  { label: "Инверторный", value: "Да" },
  { label: "Wi-fi управление", value: "Опция" },
  { label: "Режим работы", value: "Охлаждение и обогрев" },
];

export default function ProductCard({ product }: { product: ProductLike }) {
  const imgUrl = pickImg(product);
  const { price, oldPrice, discount } = pickPrice(product);
  const avail = isAvailable(product);
  const splitPrice = Math.round(parseFloat(price.replace(/[^\d]/g, "") || "0") / 4).toLocaleString("ru-RU");

  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:border-transparent">
      {/* Top Badges & Actions */}
      <div className="absolute top-4 left-4 z-10">
        {discount ? (
          <span className="bg-orange-500 text-white text-[12px] font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        ) : null}
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 bg-white rounded-full text-gray-400 hover:text-orange-500 hover:shadow-md transition">
          <BarChart3 size={18} />
        </button>
        <button className="p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 hover:shadow-md transition">
          <Heart size={18} />
        </button>
      </div>

      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative block w-full aspect-[1/1] mb-4">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={product.name ?? ""}
            fill
            className="object-contain mix-blend-multiply"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 text-xs">
            Нет фото
          </div>
        )}
      </Link>

      {/* Rating (Mocked for now as data isn't in types) */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1 text-[13px] font-bold text-[#0f172a]">
          <Star size={14} className="fill-orange-400 text-orange-400" />
          4.8
        </div>
        <div className="flex items-center gap-1 text-[13px] text-gray-400">
          <MessageCircle size={14} />
          5
        </div>
        <div className="flex items-center gap-1 text-[13px] text-gray-400 ml-auto">
          <BarChart3 size={14} className="rotate-90" />
        </div>
        <div className="text-gray-400">
          <Heart size={14} />
        </div>
      </div>

      {/* Title */}
      <Link href={`/product/${product.id}`} className="block mb-3">
        <h3 className="font-bold text-[14px] leading-tight text-[#0f172a] line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition">
          {product.name ?? `Товар #${product.id}`}
        </h3>
      </Link>

      {/* Price */}
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-[22px] font-bold text-[#0f172a]">{price}</span>
        {oldPrice && (
          <span className="text-[13px] text-gray-400 line-through decoration-gray-400">
            {oldPrice}
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="mb-4">
        {avail ? (
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            В наличии
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            Под заказ
          </div>
        )}
      </div>

      {/* Features (Visible) */}
      <div className="mb-5 space-y-1.5 flex-grow">
        {/* Try to use summary if available, otherwise mock or hide */}
        {product.summary ? (
          <div className="text-[12px] text-gray-500 leading-snug" dangerouslySetInnerHTML={{ __html: product.summary }} />
        ) : (
          <div className="text-[12px] text-gray-500 space-y-1">
            {MOCK_FEATURES.map((f, i) => (
              <div key={i} className="flex justify-between">
                <span>{f.label}:</span>
                <span className="text-[#0f172a]">{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[14px] py-2.5 rounded-lg transition shadow-sm hover:shadow-md">
          Купить
        </button>

        <div className="flex items-center gap-2 text-[13px] font-medium text-[#0f172a]">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px] font-bold">
            C
          </div>
          <span>{splitPrice} ₽ в Сплит</span>
        </div>
      </div>
    </div>
  );
}
