import React from "react";
import { motion } from "framer-motion";

export default function NotFound404Bold() {
  return (
    <div
      dir="rtl"
      className="min-h-screen grid place-items-center text-center
                 bg-gradient-to-b from-amber-100 to-amber-50
                 dark:from-zinc-950 dark:to-zinc-900 px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-3xl"
      >
        <motion.h1
          className="text-[10rem] sm:text-[14rem] font-extrabold leading-none
                     bg-clip-text text-transparent
                     bg-gradient-to-r from-amber-500 via-yellow-400 to-sky-600
                     dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-50"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          404
        </motion.h1>

        <p
          className="text-2xl sm:text-3xl font-semibold
                      text-amber-900/90 dark:text-zinc-200"
        >
          העמוד שחיפשת לא נמצא
        </p>

        <p className="text-lg sm:text-xl text-amber-900/75 dark:text-zinc-400">
          יכול להיות שהקישור שבור, נמחק, או אולי הוא בכלל לא אמור להיות כאן…
        </p>

        <div className="pt-6">
          <a
            href="/"
            className="inline-block rounded-full px-10 py-4 text-lg font-bold
                       bg-amber-400 text-[#2a1600]
                       hover:shadow-[0_8px_30px_rgba(251,191,36,.35)]
                       hover:scale-105 active:scale-95 transition-all
                       dark:bg-zinc-200 dark:text-black"
          >
            חזרה לדף הבית
          </a>
        </div>
      </motion.div>

      {/* הילה גדולה ונעימה ברקע */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle at center, rgba(251,191,36,.35) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
