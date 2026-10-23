import { apiFetch } from "./api";
import type { Genre } from "./catalog-types";

export type { Genre };

export async function fetchGenres(): Promise<Genre[]> {
  const response = await apiFetch<{ data: Genre[] }>("genres");
  return response.data;
}
