import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import DreamCard from "@/components/dreams/DreamCard";
import type { Dream } from "@/lib/api/types";

type Props = { dreams: Dream[]; isLoading?: boolean };

export default function RecentDreams({ dreams, isLoading }: Props) {
  const recent = [...dreams]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 mb-14">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold">חלומות אחרונים</h2>
      </div>
      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recent.map((dream, i) => (
            <motion.div
              key={dream._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <DreamCard dream={dream as any} showDate />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
