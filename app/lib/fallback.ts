import { dummyBooks } from "../dummy_data/books";
import type { Book } from "../models/book";

// Local shelf used only when honya-api is unreachable, so the shop still renders.

export interface DummyFilter {
  kind?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function filterDummyBooks(filter: DummyFilter = {}): Book[] {
  const { kind, search, minPrice, maxPrice } = filter;
  return dummyBooks.filter((b) => {
    if (kind && kind !== "all" && b.kind !== kind) return false;
    if (minPrice !== undefined && b.price < minPrice) return false;
    if (maxPrice !== undefined && b.price > maxPrice) return false;
    if (search) {
      const hay = `${b.title} ${b.originalTitle ?? ""} ${b.author} ${b.publisher ?? ""} ${b.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });
}

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export { dummyBooks };
