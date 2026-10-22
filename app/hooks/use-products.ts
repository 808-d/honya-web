import { useMemo } from "react";
import { honyaFetch } from "../lib/api-client";
import { useAsync } from "./use-async";
import { useRelations } from "./use-relations";
import { kindToType, availabilityToStatus, toBook } from "../lib/adapt";
import { dummyBooks, filterDummyBooks, paginate } from "../lib/fallback";
import type { ListDto, ProductDto } from "../models/api";
import type { Book } from "../models/book";

export const DEFAULT_PER_PAGE = 12;

export interface ProductQuery {
  kind?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  perPage?: number;
}

export type CatalogSource = "api" | "shelf";

async function fetchProducts(
  query: ProductQuery,
  signal: AbortSignal,
): Promise<ListDto<ProductDto>> {
  return honyaFetch<ListDto<ProductDto>>("/products", {
    query: {
      type: kindToType(query.kind ?? "all"),
      status: availabilityToStatus(query.status ?? "all"),
      search: query.search,
      min_price: query.minPrice,
      max_price: query.maxPrice,
      page: query.page,
      per_page: query.perPage ?? DEFAULT_PER_PAGE,
    },
    signal,
  });
}

export interface ProductsResult {
  books: Book[];
  total: number;
  page: number;
  perPage: number;
  loading: boolean;
  error: string | null;
  source: CatalogSource;
  refetch: () => void;
}

export function useProducts(query: ProductQuery = {}): ProductsResult {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const key = JSON.stringify(query);
  const { relations, loading: relationsLoading } = useRelations();

  const products = useAsync<ListDto<ProductDto>>(`catalog:products:${key}`, (signal) =>
    fetchProducts({ ...query, perPage }, signal),
  );

  const apiBooks = useMemo(
    () => (products.data?.items ?? []).map((dto) => toBook(dto, relations)),
    [products.data, relations],
  );

  const shelf = useMemo(() => {
    if (!products.error) return [] as Book[];
    const filtered = filterDummyBooks({
      kind: query.kind,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });
    return paginate(filtered, query.page ?? 1, perPage);
  }, [products.error, key, perPage]);

  const shelfTotal = useMemo(() => {
    if (!products.error) return 0;
    return filterDummyBooks({
      kind: query.kind,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    }).length;
  }, [products.error, key]);

  const usingShelf = Boolean(products.error);

  return {
    books: usingShelf ? shelf : apiBooks,
    total: usingShelf ? shelfTotal : products.data?.total ?? 0,
    page: products.data?.page ?? query.page ?? 1,
    perPage: products.data?.per_page ?? perPage,
    loading: products.loading || (relationsLoading && !products.error),
    error: products.error,
    source: usingShelf ? "shelf" : "api",
    refetch: products.refetch,
  };
}

export interface ProductResult {
  book: Book | null;
  related: Book[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
  source: CatalogSource;
  refetch: () => void;
}

export function useProduct(id: string | undefined): ProductResult {
  const { relations, loading: relationsLoading } = useRelations();

  const products = useAsync<ProductDto>(`catalog:product:${id}`, async (signal) => {
    if (!id) throw new Error("Missing product id");
    return honyaFetch<ProductDto>(`/products/${encodeURIComponent(id)}`, { signal });
  });

  const related = useAsync<ListDto<ProductDto>>(
    `catalog:related:${id}:${products.data?.type ?? ""}`,
    async (signal) => {
      if (!products.data) return { items: [], total: 0, page: 1, per_page: 0 };
      return honyaFetch<ListDto<ProductDto>>("/products", {
        query: { type: products.data.type, status: 1, per_page: 6 },
        signal,
      });
    },
  );

  const book = useMemo(
    () => (products.data ? toBook(products.data, relations) : null),
    [products.data, relations],
  );

  const relatedBooks = useMemo(() => {
    const items = related.data?.items ?? [];
    return items
      .filter((dto) => dto.id !== id)
      .map((dto) => toBook(dto, relations))
      .slice(0, 3);
  }, [related.data, relations, id]);

  const shelfBook = useMemo(
    () => (products.error && id ? dummyBooks.find((b) => b.id === id) ?? null : null),
    [products.error, id],
  );

  const shelfRelated = useMemo(() => {
    if (!shelfBook) return [] as Book[];
    return dummyBooks.filter((b) => b.id !== id && b.kind === shelfBook.kind).slice(0, 3);
  }, [shelfBook, id]);

  const notFound = !products.loading && !book && !shelfBook;

  return {
    book: book ?? shelfBook,
    related: shelfBook ? shelfRelated : relatedBooks,
    loading: products.loading || (relationsLoading && !products.error),
    error: products.error,
    notFound,
    source: shelfBook ? "shelf" : "api",
    refetch: products.refetch,
  };
}
