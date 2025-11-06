import React from "react";
import { motion } from "framer-motion";
export default function Footer() {
    return (<footer className="relative bg-gradient-to-r from-black via-[#1a0000] to-red-900 py-6 border-t border-red-800 shadow-[0_-4px_15px_rgba(255,0,0,0.4)] text-center">
      
      <motion.a href="https://www.linkedin.com/in/omri-rajuan/" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:fill-red-500 transition-colors">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 
            5v14c0 2.761 2.239 5 5 
            5h14c2.762 0 5-2.239 
            5-5v-14c0-2.761-2.238-5-5-5zm-11 
            19h-3v-10h3v10zm-1.5-11.268c-.966 
            0-1.75-.79-1.75-1.764s.784-1.764 
            1.75-1.764 1.75.79 
            1.75 1.764-.784 1.764-1.75 
            1.764zm13.5 
            11.268h-3v-5.604c0-1.337-.027-3.061-1.865-3.061-1.867 
            0-2.154 1.459-2.154 2.965v5.7h-3v-10h2.879v1.367h.041c.401-.76 
            1.379-1.561 2.84-1.561 3.039 0 3.599 
            2.002 3.599 4.604v5.59z"/>
        </svg>
      </motion.a>

      
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-widest text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]">
          Hōichiba <span className="text-white">宝市場</span>
        </h2>
        <p className="text-sm text-gray-300 font-light">
          The Japanese Marketplace of Second Chances
        </p>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Hōichiba — All rights reserved.
        </p>
      </div>
    </footer>);
}
