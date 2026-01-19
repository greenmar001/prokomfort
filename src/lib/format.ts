export function stripWaVars(html: string) {
  return html.replace(/\{\$[^}]+\}/g, "");
}

export function firstSku(product: any) {
  return Array.isArray(product?.skus) && product.skus.length ? product.skus[0] : null;
}

export function firstImage(product: any) {
  return Array.isArray(product?.images) && product.images.length ? product.images[0] : null;
}
