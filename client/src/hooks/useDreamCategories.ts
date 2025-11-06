import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export function useDreamCategories() {
    const { data, isLoading } = useSWR("/api/dreams/categories", fetcher);
    return {
        categories: data?.categories ?? [],
        isLoading,
    };
}
