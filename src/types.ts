export type Image = {
  url_thumb?: string;
  url_crop?: string;
  url_big?: string;
};

export type Sku = {
  price_str?: string;
  available?: number | boolean;
};

export type ProductLike = {
  id: number;
  name?: string;
  summary?: string;
  images?: Image[];
  skus?: Sku[];
  image_id?: string | number;
  ext?: string;
  count?: number; // Used in Page for categories (which are also seemingly treated loosely)
  sku_id?: string | number;
  description?: string;
};

export type Category = {
  id: number;
  name: string;
  count?: number;
};
