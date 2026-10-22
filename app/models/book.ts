/**
 * ProductKind includes the five honya-api types (manga, light-novel, novel,
 * artbook, magazine) plus a few extras used by the local dummy fallback.
 */
export type ProductKind =
  | "manga"
  | "light-novel"
  | "novel"
  | "artbook"
  | "magazine"
  | "manhwa"
  | "manhua"
  | "book";

export type CoverMotif = "wave" | "moon" | "plum" | "lantern";

/** Availability mirrors honya-api product status (0/1/2). */
export type Availability = "draft" | "active" | "archived";

/** Series status — only present on local dummy data. */
export type BookStatus = "ongoing" | "completed" | "standalone" | "preorder";

export type BookRegion =
  | "japan"
  | "korea"
  | "china"
  | "usa"
  | "uk"
  | "france"
  | "other";

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  kind: ProductKind;
  availability?: Availability;
  region?: BookRegion;
  status?: BookStatus;
  author: string;
  artist?: string;
  publisher?: string;
  volume?: number;
  price: number;
  currency: string;
  coverPalette: [string, string];
  coverMotif: CoverMotif;
  /** Remote cover URL from the API; when absent the CSS cover is drawn. */
  coverImage?: string;
  language?: string;
  pages?: number;
  isbn?: string;
  publishedYear?: number;
  rating?: number;
  stock: number;
  tags: string[];
  genres?: string[];
  description?: string;
  featured?: boolean;
  newArrival?: boolean;
}

export const KIND_LABEL: Record<ProductKind, string> = {
  manga: "漫画 manga",
  "light-novel": "小説 light novel",
  novel: "novel",
  artbook: "画集 artbook",
  magazine: "雑誌 magazine",
  manhwa: "만화 manhwa",
  manhua: "漫画 manhua",
  book: "book",
};

export const REGION_LABEL: Record<BookRegion, string> = {
  japan: "Japan",
  korea: "Korea",
  china: "China",
  usa: "USA",
  uk: "UK",
  france: "France",
  other: "Other",
};

export const STATUS_LABEL: Record<BookStatus, string> = {
  ongoing: "ongoing",
  completed: "completed",
  standalone: "standalone",
  preorder: "pre-order",
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  draft: "draft",
  active: "on sale",
  archived: "archived",
};

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
