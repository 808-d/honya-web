// Admin dashboard DTOs mirroring honya-api's admin endpoints.

export interface PermissionsDto {
  roles: string[];
  features: string[];
}

/** GET /admin/stats */
export interface StatsDto {
  products: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    low_stock: number;
  };
  orders: {
    total: number;
    paid_revenue: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipping: number;
    completed: number;
    cancelled: number;
    refunded: number;
  };
  coupons: { total: number; active: number };
  users: { total: number };
}

export interface FeatureDto {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description: string;
  features: string[];
  member_count: number;
  create_time: string;
  update_time: string;
}

export interface RoleInput {
  name: string;
  description: string;
  feature_ids: string[];
}

export interface AdminUserDto {
  id: string;
  username: string;
  display_name: string;
  email: string;
  phone?: string;
  is_verified: boolean;
  roles: string[];
  create_time: string;
}

/** Body of POST/PUT /products. */
export interface ProductInput {
  title: string;
  cover: string;
  description: string;
  publisher_id: string | null;
  publish_time: string | null;
  stock: number;
  price: number;
  status: number;
  type: number;
  author_ids: string[];
  genre_ids: string[];
  tag_ids: string[];
}

export interface CouponDto {
  id: string;
  code: string;
  type: number;
  value: number;
  min_order_amount: number;
  max_discount?: number;
  start_at?: string;
  expire_at?: string;
  usage_limit?: number;
  used_count: number;
  per_user_limit: number;
  is_active: boolean;
  create_time: string;
  update_time: string;
}

export interface CouponInput {
  code: string;
  type: number;
  value: number;
  min_order_amount: number;
  max_discount: number | null;
  start_at: string | null;
  expire_at: string | null;
  usage_limit: number | null;
  per_user_limit: number;
  is_active: boolean;
}

export interface CouponUsageDto {
  id: number;
  user_id: string;
  username: string;
  order_id: string;
  create_time: string;
}

export const PRODUCT_STATUS_LABEL: Record<number, string> = {
  0: "Draft",
  1: "Active",
  2: "Archived",
};

export const PRODUCT_TYPE_LABEL: Record<number, string> = {
  0: "Manga",
  1: "Light novel",
  2: "Novel",
  3: "Artbook",
  4: "Magazine",
};

export const COUPON_TYPE_LABEL: Record<number, string> = {
  0: "Fixed",
  1: "Percent",
};

/** Human labels for the feature catalogue, grouped by code prefix. */
export const FEATURE_GROUP_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  catalog: "Catalog",
  order: "Orders",
  coupon: "Coupons",
  role: "Roles",
  user: "Users",
};

export function featureGroup(code: string): string {
  const prefix = code.split(".")[0] ?? "other";
  return FEATURE_GROUP_LABEL[prefix] ?? "Other";
}
