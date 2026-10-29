// DTOs mirroring honya-api's internal/modules/*/dto.go.
// Every endpoint wraps its payload in the Envelope shape.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ListDto<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

/** author | genre | publisher | tag — all expose { id, name }. */
export interface NameDto {
  id: string;
  name: string;
  create_time: string;
  update_time: string;
}

/**
 * ProductResponse from internal/modules/product/dto.go.
 * status: 0=draft, 1=active, 2=archived
 * type:   0=manga, 1=light_novel, 2=novel, 3=artbook, 4=magazine
 */
export interface ProductDto {
  id: string;
  title: string;
  cover: string;
  description: string;
  publisher_id?: string;
  publish_time?: string;
  stock: number;
  price: number;
  status: number;
  type: number;
  author_ids: string[];
  genre_ids: string[];
  tag_ids: string[];
  create_time: string;
  update_time: string;
}

export interface UserDto {
  id: string;
  username: string;
  display_name: string;
  email: string;
  phone?: string;
  roles: string[];
}

export interface LoginDto {
  expires_at: number;
  user: UserDto;
}

export interface RegisterDto {
  id: string;
  username: string;
  email: string;
}

/** CartItemResponse from internal/modules/cart/dto.go. */
export interface CartItemDto {
  id: number;
  cover: string;
  title: string;
  quantity: number;
  create_time: string;
}

/** CartResponse — the full cart. */
export interface CartDto {
  items: CartItemDto[];
  cart_count: number;
}

/** CartMutationResponse — returned by add/remove. */
export interface CartMutationDto {
  item: CartItemDto;
  cart_count: number;
}

export interface AddCartItemInput {
  product_id: string;
  quantity: number;
}

/** OrderItemResponse from internal/modules/order/dto.go. */
export interface OrderItemDto {
  product_id?: string;
  product_title: string;
  product_cover: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

/**
 * OrderResponse. list endpoints omit `items`; detail/checkout include them.
 * status: 0 pending, 1 confirmed, 2 processing, 3 shipping, 4 completed,
 *         5 cancelled, 6 refunded.
 * payment_status: 0 unpaid, 1 paid, 2 failed, 3 refunded.
 * payment_method: 0 cash on delivery.
 */
export interface OrderDto {
  id: string;
  status: number;
  payment_method: number;
  payment_status: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  note: string;
  coupon_code?: string;
  paid_at?: string;
  create_time: string;
  update_time: string;
  items?: OrderItemDto[];
}

/** CreateOrderRequest — checkout uses the server-side cart. */
export interface CreateOrderInput {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  note: string;
  coupon_code: string;
  payment_method: number;
}
