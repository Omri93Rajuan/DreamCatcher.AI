import { useQuery } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import type { DreamsPage } from "@/lib/api/types";

export function useDreamsPage(page: number, limit: number, search?: string) {
  return useQuery<DreamsPage>({
    queryKey: ["dreams", { page, limit, search }],
    queryFn: async () => {
      const dreams = await DreamsApi.list({
        page,
        limit,
        sort: "-createdAt",
        search: search || undefined,
      });
      return {
        dreams,
        total: dreams.length,
        page,
        pages: Math.ceil(dreams.length / limit),
      };
    },
    placeholderData: undefined,
  });
}
