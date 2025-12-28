import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import type { DreamsPage } from "@/lib/api/types";
export function useDreamsPage(page: number, limit: number, search: string, sortBy: string = "createdAt", order: "asc" | "desc" = "desc", categories?: string[], enabled: boolean = true) {
    const trimmedSearch = (search ?? "").trim();
    const normalizedCategories = Array.isArray(categories) && categories.length
        ? [...categories].filter(Boolean).sort()
        : undefined;
    return useQuery<DreamsPage>({
        queryKey: [
            "dreams",
            {
                page,
                limit,
                search: trimmedSearch,
                sortBy,
                order,
                categories: normalizedCategories,
            },
        ],
        queryFn: () => DreamsApi.listPaged({
            page,
            limit,
            search: trimmedSearch || undefined,
            sortBy,
            order,
            categories: normalizedCategories,
        }),
        placeholderData: keepPreviousData,
        enabled,
    });
}
