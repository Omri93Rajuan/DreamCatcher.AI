import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InterpretForm from "@/components/dreams/InterpretForm";
import PopularDreams from "@/components/dreams/PopularDreams";
import RecentDreams from "@/components/dreams/RecentDreams";
import DreamsPaginated from "@/components/dreams/DreamsPaginated";
import StatsPanel from "@/components/dreams/StatsPanel";
import DreamInterpretation from "@/components/dreams/DreamInterpretation";
import type { Dream } from "@/lib/api/types";
import { useDreamsPage } from "@/hooks/useDreamsPage";
import SearchInput from "@/components/dreams/SearchInput";
import { da } from "date-fns/locale";

const PAGE_SIZE = 9;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [currentInterpretation, setCurrentInterpretation] = useState<{
    dream_text: string;
    interpretation: string;
  } | null>(null);

  const { data, isLoading, isFetching } = useDreamsPage(
    page,
    PAGE_SIZE,
    searchQuery
  );
  const dreamsForStats: Dream[] = data?.dreams ?? [];

  useEffect(() => {
    console.log(data);
  }, [data]);
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

          <InterpretForm onInterpreted={setCurrentInterpretation} />
          <SearchInput
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              setPage(1);
            }}
          />
        </div>
      </section>

      {/* תוצאת פירוש */}
      <AnimatePresence>
        {currentInterpretation && (
          <section className="max-w-6xl mx-auto px-4 mb-20">
            <DreamInterpretation interpretation={currentInterpretation} />
          </section>
        )}
      </AnimatePresence>

      {/* סטטיסטיקות */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <StatsPanel dreams={dreamsForStats} />
      </section>

      {/* פופולריים / אחרונים */}
      <PopularDreams dreams={dreamsForStats} isLoading={isLoading} />
      <RecentDreams dreams={dreamsForStats} isLoading={isLoading} />

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
