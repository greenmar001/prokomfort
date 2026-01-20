import { ProductLike } from "@/types";

export function stripWaVars(html: string) {
  return html.replace(/\{\$[^}]+\}/g, "");
}

export function firstSku(product: ProductLike) {
  return product.skus?.[0] ?? null;
}

export function firstImage(product: ProductLike) {
  return product.images?.[0] ?? null;
}
