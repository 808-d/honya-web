import type { ListDto, NameDto } from "../models/api";
import { honyaFetch } from "./api-client";

// Client-side catalog helpers shared by the data hooks.

export interface CatalogRelations {
  authors: Map<string, string>;
  genres: Map<string, string>;
  publishers: Map<string, string>;
  tags: Map<string, string>;
}

export const emptyRelations: CatalogRelations = {
  authors: new Map(),
  genres: new Map(),
  publishers: new Map(),
  tags: new Map(),
};

function index(rows: NameDto[]): Map<string, string> {
  return new Map(rows.map((row) => [row.id, row.name]));
}

async function listNames(resource: string, signal?: AbortSignal): Promise<NameDto[]> {
  const data = await honyaFetch<ListDto<NameDto>>(`/${resource}`, {
    query: { per_page: 100 },
    signal,
  });
  return data?.items ?? [];
}

/** Loads author/genre/publisher/tag id→name maps so products can be labelled. */
export async function fetchAllRelations(signal?: AbortSignal): Promise<CatalogRelations> {
  const [authors, genres, publishers, tags] = await Promise.all([
    listNames("authors", signal),
    listNames("genres", signal),
    listNames("publishers", signal),
    listNames("tags", signal),
  ]);
  return {
    authors: index(authors),
    genres: index(genres),
    publishers: index(publishers),
    tags: index(tags),
  };
}
