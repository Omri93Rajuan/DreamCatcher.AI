import { CATEGORY_META } from "@/lib/api/categoryIcons";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type Props = {
  selected: string; // "all" או מפתח כמו "flying"
  onSelect: (c: string) => void;
  showAll?: boolean; // ברירת מחדל true
  initialVisible?: number; // ברירת מחדל 8
  priorityOrder?: Array<keyof typeof CATEGORY_META>; // אופציונלי
};

export default function CategoryPills({
  selected,
  onSelect,
  showAll = true,
  initialVisible = 8,
  priorityOrder,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // מיון עם עדיפות ל-TOP ואז אלפביתי
  const entries = useMemo(() => {
    const all = Object.entries(CATEGORY_META) as Array<
      [
        keyof typeof CATEGORY_META,
        (typeof CATEGORY_META)[keyof typeof CATEGORY_META]
      ]
    >;

    const order =
      priorityOrder ??
      ([
        "romance",
        "death",
        "flying",
        "falling",
        "being_chased",
        "teeth",
        "exam",
        "late",
      ].filter((k) => k in CATEGORY_META) as Array<keyof typeof CATEGORY_META>);

    const pri = new Map(order.map((k, i) => [k, i]));
    return all.sort(([ak, av], [bk, bv]) => {
      const ai = pri.has(ak) ? (pri.get(ak) as number) : 999;
      const bi = pri.has(bk) ? (pri.get(bk) as number) : 999;
      if (ai !== bi) return ai - bi;
      return av.label.localeCompare(bv.label, "he");
    });
  }, [priorityOrder]);

  const top = entries.slice(0, initialVisible);
  const rest = entries.slice(initialVisible);

  // אנימציות כניסה
  const listVariants = {
    hidden: { opacity: 0, y: 8 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div className="relative mb-6" dir="rtl">
      {/* spotlight עדין בריחוף בכל אזור הצ’יפים */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(1200px_400px_at_var(--mx,50%)_-10%,rgba(255,255,255,0.10),transparent_60%)] transition-[--mx] duration-300" />
      <div
        className="flex flex-col gap-4"
        onMouseMove={(e) => {
          (e.currentTarget.style as any).setProperty(
            "--mx",
            `${e.nativeEvent.offsetX}px`
          );
        }}
      >
        {/* שורה ראשית */}
        <div className="flex flex-wrap gap-3 justify-center">
          {showAll && (
            <AnimatedPill
              i={0}
              active={selected === "all"}
              gradient="from-purple-500 to-pink-500"
              onClick={() => onSelect("all")}
            >
              הכל
            </AnimatedPill>
          )}

          {top.map(([id, meta], i) => {
            const Icon = meta.icon as any;
            const active = selected === id;
            return (
              <AnimatedPill
                key={id}
                i={i + 1}
                active={active}
                gradient={meta.gradient}
                onClick={() => onSelect(id)}
              >
                <Icon className="w-4 h-4" />
                <span>{meta.label}</span>
              </AnimatedPill>
            );
          })}

          {rest.length > 0 && (
            <motion.button
              variants={listVariants}
              initial="hidden"
              animate="show"
              custom={top.length + 2}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 1 }}
              onClick={() => setExpanded((s) => !s)}
              className="relative px-5 py-2 rounded-2xl flex items-center gap-2 transition-all border
                         bg-white/[0.06] hover:bg-white/[0.10] text-purple-100 border-white/15
                         shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              aria-expanded={expanded}
            >
              {expanded ? "פחות…" : "עוד…"}
            </motion.button>
          )}
        </div>

        {/* הרחבה */}
        {expanded && rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10
                       bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]
                       p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {rest.map(([id, meta], i) => {
                const Icon = meta.icon as any;
                const active = selected === id;
                return (
                  <AnimatedPill
                    key={id}
                    i={i}
                    active={active}
                    gradient={meta.gradient}
                    onClick={() => onSelect(id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{meta.label}</span>
                  </AnimatedPill>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** ====== Pill עם “וואו”: זוהר, גבול גרדיאנט אנימטיבי, לחיצה 3D ====== */
function AnimatedPill({
  children,
  gradient,
  active,
  onClick,
  i = 0,
}: {
  children: React.ReactNode;
  gradient: string; // לדוגמה: "from-blue-500 to-cyan-500"
  active?: boolean;
  onClick?: () => void;
  i?: number;
}) {
  const base =
    "relative group px-5 py-2 rounded-2xl flex items-center gap-2 border backdrop-blur-md transition-all";

  return (
    <motion.button
      custom={i}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.96, y: 1 }}
      onClick={onClick}
      className={[
        base,
        active
          ? // מצב פעיל: מילוי גרדיאנט + הילה + גבול בהיר
            `text-white border-white/30 bg-gradient-to-r ${gradient}
             shadow-[0_10px_30px_rgba(0,0,0,0.35)]
             before:absolute before:inset-[-2px] before:rounded-[22px]
             before:bg-[conic-gradient(from_180deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_30%,rgba(255,255,255,0.35))]
             before:opacity-30 before:blur-[8px] before:animate-[spin_6s_linear_infinite] before:content-['']`
          : // מצב רגיל: זכוכית עדינה + גבול + הילה קטנה ב-hover
            `text-purple-100 border-white/15 bg-white/[0.06] hover:bg-white/[0.10]
             shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
             after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl
             after:opacity-0 group-hover:after:opacity-100 after:transition
             after:bg-[radial-gradient(250px_60px_at_center,rgba(255,255,255,0.10),transparent_70%)]`,
      ].join(" ")}
    >
      {/* טבעת אור עדינה רק כש־active */}
      {active && (
        <span className="pointer-events-none absolute -inset-0.5 rounded-[22px] blur-md opacity-40 bg-gradient-to-r from-white/50 to-white/20" />
      )}
      {/* תוכן */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
