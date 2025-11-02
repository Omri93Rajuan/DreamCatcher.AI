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
const PAGE_SIZE = 9;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentInterpretation, setCurrentInterpretation] = useState<{
    dream_text: string;
    interpretation: string;
  } | null>(null);

  // אם "all" → לא שולחים categories בכלל
  const categoriesParam = useMemo(
    () => (selectedCategory === "all" ? undefined : [selectedCategory]),
    [selectedCategory]
  );

  // שליפת חלומות עם פאג'ינציה
  const { data, isLoading, isFetching } = useDreamsPage(
    page,
    PAGE_SIZE,
    searchQuery,
    "createdAt",
    "desc",
    categoriesParam
  );

  // >>> מערך חלומות לשאר ה־UI (פופולריים/רשימות)
  const dreamsForCards = data?.dreams ?? [];

  // סטטיסטיקות גלובליות מהשרת
  const [stats, setStats] = useState<GlobalDreamStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 7 ימים ברירת מחדל (אפשר לשנות)
        const s = await DreamsApi.getGlobalStats(7);
        if (mounted) setStats(s);
      } catch (e: any) {
        if (mounted) setStatsError(e?.message ?? "Failed to load stats");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // reset עמוד בכל שינוי סינון/חיפוש
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              גלה את המשמעות של החלומות שלך
            </h1>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              פענח את החלומות שלך באמצעות בינה מלאכותית מתקדמת
            </p>
          </motion.div>

          <InterpretForm />
        </div>
      </section>

      {/* תוצאת פירוש */}
      <AnimatePresence>
        {currentInterpretation && (
          <section className="max-w-6xl mx-auto px-4 mb-20">
            <DreamInterpretation />
          </section>
        )}
      </AnimatePresence>

      {/* סטטיסטיקות גלובליות */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        {statsError ? (
          <div className="text-sm text-red-400">
            שגיאה בטעינת סטטיסטיקות: {statsError}
          </div>
        ) : stats ? (
          <StatsPanel stats={stats} showPublicTotal />
        ) : (
          // שימר קטן בזמן טעינה
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-white/5 animate-pulse border border-white/10"
              />
            ))}
          </div>
        )}
      </section>

      {/* פופולריים / אחרונים */}
      <PopularDreams />
      <SearchInput
        value={searchQuery}
        onChange={(v) => {
          setSearchQuery(v);
          setPage(1);
        }}
      />
      {/* סינון לפי קטגוריות */}
      <section className="max-w-6xl mx-auto px-4">
        <CategoryPills
          selected={selectedCategory}
          onSelect={(c) => setSelectedCategory(c)}
          showAll
        />
      </section>

      {/* כל החלומות + פג'ינציה */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">כל החלומות</h2>
        <DreamsPaginated
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
