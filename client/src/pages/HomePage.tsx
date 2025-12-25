import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InterpretForm from "@/components/dreams/InterpretForm";
import PopularDreams from "@/components/dreams/PopularDreams";
import RecentDreams from "@/components/dreams/RecentDreams";
import DreamsPaginated from "@/components/dreams/DreamsPaginated";
import StatsPanel from "@/components/dreams/StatsPanel";
import DreamInterpretation from "@/components/dreams/DreamInterpretation";
import { useDreamsPage } from "@/hooks/useDreamsPage";
import SearchInput from "@/components/dreams/SearchInput";
import CategoryPills from "@/components/dreams/CategoryPills";
import { DreamsApi } from "@/lib/api/dreams";
import { GlobalDreamStats } from "@/lib/api/types";
import { useTranslation } from "react-i18next";
const PAGE_SIZE = 9;
export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentInterpretation, setCurrentInterpretation] = useState<{
    dream_text: string;
        interpretation: string;
    } | null>(null);
    const categoriesParam = useMemo(() => (selectedCategory === "all" ? undefined : [selectedCategory]), [selectedCategory]);
  const { data, isLoading, isFetching } = useDreamsPage(page, PAGE_SIZE, searchQuery, "createdAt", "desc", categoriesParam);
  const dreamsForCards = data?.dreams ?? [];
    const [stats, setStats] = useState<GlobalDreamStats | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const s = await DreamsApi.getGlobalStats(7);
                if (mounted)
                    setStats(s);
            }
            catch (e: any) {
                if (mounted)
                    setStatsError(e?.message ?? "Failed to load stats");
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 1500); // debounce typing by 1.5s
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);
    return (<div className="min-h-screen pb-20">
      
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center" dir={i18n.dir()}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="
          font-extrabold leading-[1.1] tracking-tight
          text-4xl sm:text-6xl md:text-7xl
          bg-clip-text text-transparent
          bg-gradient-to-r from-[#D4A100] via-[#C4903A] to-[#B87E40]   /* Light */
          dark:from-purple-300 dark:via-purple-200 dark:to-amber-200 /* Dark */
          mb-6
        ">
              {t("home.heroTitle")}
            </h1>

            <p className="
          max-w-2xl mx-auto mb-8
          text-lg md:text-xl font-medium
          text-[#B87E40]       /* Light */
          dark:text-purple-200 /* Dark */
        ">
              {t("home.heroSubtitle")}
            </p>
          </motion.div>

          <InterpretForm />
        </div>
      </section>

      
      <AnimatePresence>
        {currentInterpretation && (<section className="max-w-6xl mx-auto px-4 mb-20">
            <DreamInterpretation />
          </section>)}
      </AnimatePresence>

      
      <section className="max-w-7xl mx-auto px-4 mb-20">
        {statsError ? (<div className="text-sm text-red-400">
            {t("home.statsError", { message: statsError })}
          </div>) : stats ? (<StatsPanel stats={stats}/>) : (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (<div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse border border-white/10"/>))}
          </div>)}
      </section>

      
      <PopularDreams />
      <SearchInput value={searchInput} onChange={setSearchInput} />
      
      <section className="max-w-6xl mx-auto px-4">
        <CategoryPills selected={selectedCategory} onSelect={(c) => setSelectedCategory(c)} showAll/>
      </section>

      
      <section className="max-w-7xl mx-auto px-4" dir={i18n.dir()}>
        <h2 className="text-3xl font-bold mb-6">{t("home.allDreams")}</h2>
        <DreamsPaginated data={data} isLoading={isLoading} isFetching={isFetching} onPageChange={setPage}/>
      </section>
    </div>);
}
