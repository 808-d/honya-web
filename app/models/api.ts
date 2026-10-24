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
