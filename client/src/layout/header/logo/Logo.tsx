import React from "react";
import { motion } from "framer-motion";
export default function Logo() {
    return (<div className="relative select-none" aria-label="Hōichiba Logo">
      <motion.h1 className="
          relative font-extrabold tracking-widest
          text-4xl md:text-5xl
          text-red-600
          drop-shadow-[0_0_18px_rgba(255,0,0,0.55)]
        " animate={{
            x: [0, 0.3, -0.3, 0.2, -0.2, 0],
            y: [0, -0.2, 0.2, 0, -0.1, 0],
            rotate: [0, 0.2, -0.2, 0],
            filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
        }} transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
        }} whileHover={{
            x: [0, -2, 2, -1, 1, 0],
            y: [0, 1, -1, 2, -2, 0],
            rotate: [0, -0.5, 0.5, -0.3, 0.3, 0],
            letterSpacing: ["0.2em", "0.3em", "0.2em"],
            filter: [
                "brightness(1.3) contrast(1.2)",
                "brightness(1.15) contrast(1.1)",
                "brightness(1)",
            ],
            transition: { duration: 0.4 },
        }}>
        
        <span className="relative z-10">宝市場</span>

        
        <span className="absolute inset-0 z-0 text-transparent">
          <span className="
              absolute inset-0 text-cyan-400 blur-[1px]
              translate-x-[2px] -translate-y-[1px] opacity-70
            ">
            宝市場
          </span>
        </span>

        
        <span className="absolute inset-0 z-0 text-transparent">
          <span className="
              absolute inset-0 text-fuchsia-400 blur-[1px]
              -translate-x-[2px] translate-y-[1px] opacity-70
            ">
            宝市場
          </span>
        </span>
      </motion.h1>

      
      <motion.p className="mt-1 text-xs md:text-sm text-gray-200/90 tracking-wide" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} whileHover={{
            x: [0, 0.5, -0.5, 0],
            transition: { duration: 0.25 },
        }}>
        Hōichiba — Second-Hand Treasures
      </motion.p>
    </div>);
}
