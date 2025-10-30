import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Dream } from "@/lib/api/types";

export default function StatsPanel({ dreams }: { dreams: Dream[] }) {
  const total = dreams.length;
  const shared = dreams.filter((d) => d.isShared).length;
  const lastWeek = dreams.filter(
    (d) =>
      Date.now() - new Date(d.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  const stats = [
    {
      icon: TrendingUp,
      label: "סה״כ חלומות",
      value: total,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-500/20",
      text: "text-purple-300",
    },
    {
      icon: Eye,
      label: "שותפו לאחרים",
      value: shared,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-500/20",
      text: "text-blue-300",
    },
    {
      icon: BarChart3,
      label: "חדשים השבוע",
      value: lastWeek,
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-500/20",
      text: "text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="glass-card border-purple-500/30 overflow-hidden relative group">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />
            <CardContent className="p-6 relative z-10">
              <div
                className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}
              >
                <s.icon className={`w-7 h-7 ${s.text}`} />
              </div>
              <div className="text-4xl font-bold mb-2 text-white">
                {s.value}
              </div>
              <div className={`text-sm font-medium ${s.text}`}>{s.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
