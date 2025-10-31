import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, TrendingUp, BarChart3 } from "lucide-react";

export type GlobalDreamStats = {
  totalAll: number;
  totalPublic: number;
  newSince: number;
  publishedSince: number;
  windowDays: number;
  sinceISO?: string;
};

type Props = {
  stats: GlobalDreamStats;
  brandPrimary?: string; // למשל סגול הלוגו
  brandAccent?: string; // למשל זהב הלוגו
  brandMuted?: string; // אפור למצב פרטי
  className?: string;
};

export default function StatsPanelUltraCompact({
  stats,
  brandPrimary = "#5B1FA6",
  brandAccent = "#F2C94C",
  brandMuted = "#7A7A7A",
  className,
}: Props) {
  const privateCount = Math.max(stats.totalAll - stats.totalPublic, 0);
  const publicRatio = stats.totalPublic / Math.max(stats.totalAll, 1);

  const pieData = [
    { name: "ציבורי", value: stats.totalPublic, color: brandAccent },
    { name: "פרטי", value: privateCount, color: brandMuted },
  ];

  const KPIs = [
    { icon: TrendingUp, label: "סה״כ חלומות", value: stats.totalAll },
    {
      icon: BarChart3,
      label: `חדשים ב־${stats.windowDays} ימים`,
      value: stats.newSince,
    },
    {
      icon: Eye,
      label: `פורסמו ב־${stats.windowDays} ימים`,
      value: stats.publishedSince,
    },
  ];

  return (
    <div dir="rtl" className={className}>
      {/* KPIs – כרטיסים נמוכים, ספרות גדולות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {KPIs.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-white/5 border-white/10 rounded-xl">
              <CardContent className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-white/60 text-xs mb-1">
                  <Icon size={16} className="text-white/60" />
                  <span>{label}</span>
                </div>
                {/* מספר גדול למרות כרטיס קטן */}
                <div className="text-6xl md:text-5xl font-extrabold leading-none text-white">
                  {value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* דונאט קטן + טקסט גדול */}
      <Card className="bg-white/5 border-white/10 rounded-xl">
        <CardContent className="px-4 py-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={26}
                    outerRadius={36}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((p, idx) => (
                      <Cell key={idx} fill={p.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* כיתוב בולט מתחת לדונאט */}
            <div
              className="mt-2 text-lg md:text-xl font-semibold"
              style={{ color: brandAccent }}
            >
              {Math.round(publicRatio * 100)}% ציבוריים
            </div>
            <div className="text-xs text-white/70">
              {privateCount.toLocaleString()} עדיין פרטיים
            </div>

            {/* פס יחס שיתופים – דק וקצר */}
            <div className="w-full max-w-md mt-4">
              <div className="flex items-center justify-between text-[11px] text-white/60 mb-1">
                <span>יחס שיתופים</span>
                <span>{Math.round(publicRatio * 100)}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${publicRatio * 100}%`,
                    background: brandPrimary,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
