"use client";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound404Bold() {
  const { t, i18n } = useTranslation();

  return (
    <div
      dir={i18n.dir()}
      className="relative isolate min-h-screen grid place-items-center overflow-hidden text-center
                 bg-gradient-to-b from-amber-100 to-amber-50
                 dark:from-[#050505] dark:via-[#0b0a08] dark:to-black px-8"
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
                     dark:from-amber-500 dark:via-yellow-200 dark:to-amber-600"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          404
        </motion.h1>

        <p className="text-2xl sm:text-3xl font-semibold text-amber-900/90 dark:text-amber-50">
          {t("notFoundPage.title")}
        </p>

        <p className="text-lg sm:text-xl text-amber-900/75 dark:text-zinc-300">
          {t("notFoundPage.description")}
        </p>

        <div className="pt-6">
          <Link
            to="/"
            className="inline-block rounded-full px-10 py-4 text-lg font-bold
                       bg-amber-400 text-[#2a1600]
                       hover:shadow-[0_8px_30px_rgba(251,191,36,.35)]
                       hover:scale-105 active:scale-95 transition-all
                       dark:bg-amber-400 dark:text-[#1b1200]
                       dark:hover:shadow-[0_8px_35px_rgba(251,191,36,.28)]"
          >
            {t("notFoundPage.backHome")}
          </Link>
        </div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-100"
        style={{
          background:
            "radial-gradient(circle at center, rgba(251,191,36,.18) 0%, transparent 62%)",
        }}
      />
    </div>
  );
}
