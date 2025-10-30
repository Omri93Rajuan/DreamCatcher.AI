// hooks/useDreamsPage.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import type { DreamsPage } from "@/lib/api/types";

export function useDreamsPage(page: number, limit: number, search?: string) {
  return useQuery<DreamsPage>({
    queryKey: ["dreams", { page, limit, search }],
    queryFn: () =>
      DreamsApi.listPaged({
        page,
        limit,
        sort: "-createdAt", // או sortBy/order
        search: search || undefined,
      }),
    placeholderData: keepPreviousData, // ⬅️ תחליף ל-keepPreviousData ב-v5
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });
}
