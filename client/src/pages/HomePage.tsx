import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import InterpretForm from "@/components/dreams/InterpretForm";
import { useDreamsPage } from "@/hooks/useDreamsPage";
import SearchInput from "@/components/dreams/SearchInput";
import { DreamsApi } from "@/lib/api/dreams";
import { GlobalDreamStats } from "@/lib/api/types";
import { useTranslation } from "react-i18next";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { getFriendlyErrorMessage } from "@/lib/api/errors";

const PopularDreams = lazy(() => import("@/components/dreams/PopularDreams"));
const DreamsPaginated = lazy(() => import("@/components/dreams/DreamsPaginated"));
const StatsPanel = lazy(() => import("@/components/dreams/StatsPanel"));
const CategoryPills = lazy(() => import("@/components/dreams/CategoryPills"));

const PAGE_SIZE = 9;
const SectionFallback = () => (
  <div className="py-8 text-center text-sm text-slate-500 dark:text-white/60" />
);

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categoriesParam = useMemo(() => (selectedCategory === "all" ? undefined : [selectedCategory]), [selectedCategory]);
  const popularSection = useInViewOnce<HTMLElement>({ rootMargin: "500px" });
  const dreamsSection = useInViewOnce<HTMLElement>({ rootMargin: "500px" });
  const shouldLoadStats = true;
  const shouldLoadPopular = popularSection.isInView;
  const shouldLoadDreams = dreamsSection.isInView;

  const { data, isLoading, isFetching } = useDreamsPage(page, PAGE_SIZE, searchQuery, "createdAt", "desc", categoriesParam, shouldLoadDreams);
  const isDreamsLoading = shouldLoadDreams && isLoading;
  const [stats, setStats] = useState<GlobalDreamStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldLoadStats || stats || statsError) return;

    let mounted = true;
    (async () => {
      try {
        const s = await DreamsApi.getGlobalStats(7);
        if (mounted) setStats(s);
      } catch (e: any) {
        if (mounted) setStatsError(getFriendlyErrorMessage(e, t, "stats"));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [shouldLoadStats, stats, statsError, t]);

  // faster, lighter search debounce so results feel instant
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);
  return (
    <div className="min-h-screen pb-20">
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center" dir={i18n.dir()}>
          <div className="animate-[fadeIn_0.45s_ease-out]">
            <h1
              className="
          font-extrabold leading-[1.1] tracking-tight
          text-4xl sm:text-6xl md:text-7xl
          max-w-4xl mx-auto
          text-slate-950 dark:text-white
          mb-6
        "
            >
              {t("home.heroTitle")}
            </h1>

            <p
              className="
          max-w-2xl mx-auto mb-8
          text-lg md:text-xl font-medium
          text-slate-600
          dark:text-white/70
        "
            >
              {t("home.heroSubtitle")}
            </p>
          </div>

          <InterpretForm />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mb-20">
        {statsError ? (
          <div className="text-sm text-rose-600 dark:text-rose-300">
            {t("home.statsError", { message: statsError })}
          </div>
        ) : stats ? (
          <Suspense fallback={<SectionFallback />}>
            <StatsPanel stats={stats} />
          </Suspense>
        ) : (
          null
        )}
      </section>

      <section ref={popularSection.ref} className="min-h-24">
        {shouldLoadPopular && (
          <Suspense fallback={<SectionFallback />}>
            <PopularDreams />
          </Suspense>
        )}
      </section>

      <SearchInput value={searchInput} onChange={setSearchInput} />

      <section className="max-w-6xl mx-auto px-4">
        <Suspense fallback={<SectionFallback />}>
          <CategoryPills selected={selectedCategory} onSelect={(c) => setSelectedCategory(c)} showAll />
        </Suspense>
      </section>

      <section ref={dreamsSection.ref} className="max-w-7xl mx-auto px-4 min-h-48" dir={i18n.dir()}>
        <h2 className="text-3xl font-bold mb-6">{t("home.allDreams")}</h2>
        {shouldLoadDreams ? (
          <Suspense fallback={<SectionFallback />}>
            <DreamsPaginated
              data={data}
              isLoading={isDreamsLoading}
              isFetching={isFetching && shouldLoadDreams}
              onPageChange={setPage}
            />
          </Suspense>
        ) : (
          <SectionFallback />
        )}
      </section>
    </div>
  );
}
