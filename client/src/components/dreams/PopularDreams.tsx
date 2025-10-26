// src/components/dreams/PopularDreams.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import DreamCard from "@/components/dreams/DreamCard";
import { DreamsApi } from "@/lib/api/dreams";
import { useQuery } from "@tanstack/react-query";
import type { Dream } from "@/lib/api/types";
import { log } from "console";

export default function PopularDreams() {
  const { data: dreams = [], isLoading } = useQuery({
    queryKey: ["popular-dreams"],
    queryFn: () => DreamsApi.getPopular(6),
  });

  useEffect(() => {
    console.log("Popular dreams:", dreams);
  }, []);
  return (
    <section className="max-w-7xl mx-auto px-4 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-8 h-8 text-amber-400" />
        <h2 className="text-3xl font-bold">החלומות הפופולריים ביותר</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((dream, i) => (
            <motion.div
              key={dream._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <DreamCard dream={dream as any} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
