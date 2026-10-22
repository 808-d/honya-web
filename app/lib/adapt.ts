import type { ProductDto } from "../models/api";
import type {
  Availability,
  Book,
  CoverMotif,
  ProductKind,
} from "../models/book";
import type { CatalogRelations } from "./catalog";

/** honya-api product type codes (migrations/000001_init.up.sql). */
export const PRODUCT_TYPE = {
  manga: 0,
  "light-novel": 1,
  novel: 2,
  artbook: 3,
  magazine: 4,
} as const;

const TYPE_TO_KIND: Record<number, ProductKind> = {
  0: "manga",
  1: "light-novel",
  2: "novel",
  3: "artbook",
  4: "magazine",
};

const STATUS_TO_AVAILABILITY: Record<number, Availability> = {
  0: "draft",
  1: "active",
  2: "archived",
};

const AVAILABILITY_TO_STATUS: Record<Availability, number> = {
  draft: 0,
  active: 1,
  archived: 2,
};

/** Kanagawa-wave cover pairs; picked deterministically per product id. */
const COVER_PALETTES: Array<[string, string]> = [
  ["#0F2847", "#2E6B9E"],
  ["#12395B", "#1D4E7E"],
  ["#B5402A", "#6B1F12"],
  ["#16202E", "#4A5D4E"],
  ["#6B4A2F", "#3E2A18"],
  ["#1D4E7E", "#4A5D4E"],
  ["#C19A5B", "#6B4A2F"],
  ["#3A4657", "#0F2847"],
  ["#16202E", "#B5402A"],
  ["#D9CCB0", "#1D4E7E"],
];

const MOTIFS: CoverMotif[] = ["wave", "moon", "plum", "lantern"];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function paletteFor(id: string): [string, string] {
  return COVER_PALETTES[hash(id) % COVER_PALETTES.length];
}

export function motifFor(id: string): CoverMotif {
  return MOTIFS[hash(`${id}:motif`) % MOTIFS.length];
}

export function kindToType(kind: string): number | undefined {
  return (PRODUCT_TYPE as Record<string, number | undefined>)[kind];
}

export function typeToKind(type: number): ProductKind {
  return TYPE_TO_KIND[type] ?? "novel";
}

export function availabilityToStatus(value: string): number | undefined {
  return (AVAILABILITY_TO_STATUS as Record<string, number | undefined>)[value];
}

function nameList(ids: string[], lookup: Map<string, string>): string[] {
  return ids.map((id) => lookup.get(id)).filter((n): n is string => Boolean(n));
}

/** Maps a honya-api ProductResponse into the UI's Book view model. */
export function toBook(dto: ProductDto, relations: CatalogRelations): Book {
  const authors = nameList(dto.author_ids ?? [], relations.authors);
  const publishedYear = dto.publish_time
    ? new Date(dto.publish_time).getFullYear()
    : undefined;

  return {
    id: dto.id,
    title: dto.title,
    originalTitle: dto.title,
    kind: typeToKind(dto.type),
    availability: STATUS_TO_AVAILABILITY[dto.status] ?? "active",
    author: authors.length ? authors.join(", ") : "Unknown author",
    publisher: dto.publisher_id
      ? relations.publishers.get(dto.publisher_id)
      : undefined,
    price: dto.price,
    currency: "¥",
    coverImage: dto.cover || undefined,
    coverPalette: paletteFor(dto.id),
    coverMotif: motifFor(dto.id),
    description: dto.description || undefined,
    stock: dto.stock,
    publishedYear,
    genres: nameList(dto.genre_ids ?? [], relations.genres),
    tags: nameList(dto.tag_ids ?? [], relations.tags),
    newArrival: publishedYear !== undefined && publishedYear >= new Date().getFullYear() - 1,
  };
}
