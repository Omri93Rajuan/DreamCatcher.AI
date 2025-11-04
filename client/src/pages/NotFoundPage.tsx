"use client";
import React from "react";
import { motion } from "framer-motion";

export default function NotFound404() {
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const msgs = [
    "מה אתה עושה פה?",
    "הם יודעים שאתה כאן",
    "אל תמצמץ",
    "אל תסתובב",
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % msgs.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - r.width / 2) / r.width;
        const y = (e.clientY - r.height * 0.5) / r.height;
        setMouse({ x, y });
      }}
      className="relative min-h-screen grid place-items-center px-4 text-center select-none overflow-hidden transition-colors
      bg-[radial-gradient(circle_at_50%_-10%,#fff,rgba(255,255,255,.95)_35%,#fff2bf_68%,#e9d5ff_98%)]
      dark:bg-black"
    >
      <LightHalo />
      <DarkHorror mouse={mouse} msg={msgs[idx]} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-40 max-w-xl"
      >
        <motion.h1
          className="text-[8rem] font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-yellow-400 to-sky-600 dark:from-fuchsia-600 dark:via-rose-500 dark:to-purple-500 drop-shadow-[0_12px_60px_rgba(255,100,100,.45)]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          404
        </motion.h1>
        <p className="mt-3 text-xl font-semibold text-amber-800/90 dark:hidden">
          הדרך הזו מובילה רק לשמיים — אין כאן עמוד.
        </p>
        <p className="hidden dark:block mt-3 text-xl font-semibold text-rose-100/95 tracking-wide">
          {msgs[idx]}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a
            href="/"
            className="rounded-full px-6 py-3 text-sm font-bold bg-amber-400 text-[#2a1600] shadow-lg hover:shadow-xl transition dark:bg-red-600 dark:text-white"
          >
            חזרה למקום בטוח
          </a>
          <a
            href="/dreams"
            className="rounded-full px-6 py-3 text-sm font-semibold border border-amber-900/20 bg-white/70 backdrop-blur-md hover:bg-white/90 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
          >
            לחקור חלומות
          </a>
        </div>
      </motion.div>

      <style>{`
        @keyframes breath { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }
        @keyframes rays { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes cam { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(.7px,-.7px,0) } }
        @keyframes strobe { 0%,96% { opacity:0 } 97% { opacity:.95 } 100% { opacity:0 } }
      `}</style>
    </div>
  );
}

function LightHalo() {
  return (
    <div className="absolute inset-0 pointer-events-none dark:hidden">
      <div
        className="absolute left-1/2 -translate-x-1/2 top-24 w-[820px] h-[820px] rounded-full blur-3xl opacity-80"
        style={{
          background:
            "conic-gradient(from 120deg, rgba(255,255,255,.95), #ffeaa1, #fff6d9, rgba(255,255,255,.95))",
          animation: "rays 40s linear infinite",
        }}
      />
    </div>
  );
}

function DarkHorror({
  mouse,
  msg,
}: {
  mouse: { x: number; y: number };
  msg: string;
}) {
  const mx = Math.max(-0.5, Math.min(0.5, mouse.x)) * 26;
  const my = Math.max(-0.5, Math.min(0.5, mouse.y)) * 14;
  return (
    <div className="absolute inset-0 hidden dark:block">
      <div
        className="absolute inset-0"
        style={{ animation: "cam 0.8s ease-in-out infinite" }}
      />
      <div
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(30,50,90,.65) 0%, rgba(5,8,12,.6) 55%, rgba(0,0,0,.95) 70%)",
          filter: "blur(40px)",
          opacity: 0.9,
          animation: "breath 6s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,.95))]" />

      <div className="absolute left-1/2 top-[56%] -translate-x-1/2 flex gap-16 z-40">
        <Eye big mx={mx} my={my} />
        <Eye big mx={mx} my={my} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.95 }}
        transition={{ delay: 0.55 }}
        className="absolute left-1/2 top-[70%] -translate-x-1/2 text-2xl text-rose-100/95 tracking-wide z-40"
      >
        {msg}
      </motion.p>

      <div
        className="absolute inset-0 pointer-events-none z-50"
        style={{ animation: "strobe 9s infinite" }}
      />
    </div>
  );
}

function Eye({
  mx,
  my,
  big = false,
}: {
  mx: number;
  my: number;
  big?: boolean;
}) {
  const size = big ? 112 : 72;
  return (
    <div className="relative">
      <motion.span
        className="block rounded-full bg-[#1a131a] ring-2 ring-rose-900/60 shadow-[0_0_120px_rgba(255,160,0,.5)]"
        style={{ width: size, height: size }}
        initial={{ scale: 0.96 }}
        animate={{ scale: [0.96, 1, 0.96] }}
        transition={{ repeat: Infinity, duration: 5 }}
      >
        <span
          className="absolute inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #ffe08a 10%, #c28900 45%, #2a1200 60%, #000 78%)",
          }}
        />
        <span
          className="absolute left-1/2 top-1/2 rounded-full bg-black"
          style={{
            width: size * 0.2,
            height: size * 0.2,
            transform: `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`,
          }}
        />
        <span className="absolute left-[60%] top-[35%] w-3 h-3 rounded-full bg-white/90" />
      </motion.span>
    </div>
  );
}
