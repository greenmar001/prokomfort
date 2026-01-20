export type Image = {
  url_thumb?: string;
  url_crop?: string;
  url_big?: string;
};

export type Sku = {
  price_str?: string;
  available?: number | boolean;
  compare_price?: number;
};

export type FeatureValue = string | number | { value: string | number; unit?: string };

export type ProductLike = {
  id: number;
  name?: string;
  summary?: string;
  url?: string; // Slug/URL part
  frontend_url?: string;
  images?: Image[];
  skus?: Sku[];
  image_id?: string | number;
  ext?: string;
  count?: number;
  sku_id?: string | number;
  description?: string;
  features?: Record<string, FeatureValue>; // Key-value map of features
  rating?: number;
  vote_count?: number;
  category_id?: number;
};

export type Category = {
  id: number;
  name: string;
  url?: string;
  full_url?: string;
  count?: number;
  parent_id?: number;
};
