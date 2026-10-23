import { apiFetch } from "./api";
import type { SearchResult } from "./search";

export async function fetchRelatedMovies(slug: string): Promise<SearchResult[]> {
  const response = await apiFetch<{ data: SearchResult[] }>(`movies/${slug}/related`);
  return response.data;
}

export async function fetchRelatedSeries(slug: string): Promise<SearchResult[]> {
  const response = await apiFetch<{ data: SearchResult[] }>(`series/${slug}/related`);
  return response.data;
}
