// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { Eye, Lock, Globe2, TrendingUp } from "lucide-react";
// import { motion } from "framer-motion";

// import { DreamsApi } from "@/lib/api/dreams";
// import type { PopularRow } from "@/lib/api/types";

// function TeaserCard({ row, idx }: { row: PopularRow; idx: number }) {
//   const navigate = useNavigate();
//   const onClick = () => navigate(`/dreams/${row.dreamId}`);

//   return (
//     <motion.button
//       onClick={onClick}
//       initial={{ opacity: 0, y: 14 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35, delay: idx * 0.06 }}
//       className="text-left w-full rounded-xl glass-card border border-purple-500/30 hover:border-purple-400/60 hover:shadow-lg transition-all p-4 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
//     >
//       <div className="flex items-start justify-between gap-3">
//         <h3 className="text-white font-semibold leading-snug clamp-2">
//           {row.title || "חלום ללא כותרת"}
//         </h3>
//         <span
//           className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
//             row.isShared
//               ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
//               : "text-purple-300 border-purple-500/30 bg-purple-500/10"
//           }`}
//           title={row.isShared ? "שותף" : "פרטי"}
//         >
//           {row.isShared ? (
//             <Globe2 className="w-3.5 h-3.5" />
//           ) : (
//             <Lock className="w-3.5 h-3.5" />
//           )}
//           {row.isShared ? "שותף" : "פרטי"}
//         </span>
//       </div>

//       <div className="mt-3 flex items-center justify-between text-sm">
//         <div className="inline-flex items-center gap-2 text-purple-200">
//           <Eye className="w-4 h-4" />
//           <span className="font-semibold">{row.views7d}</span>
//           <span className="text-purple-300/80">צפיות השבוע</span>
//         </div>
//         <span className="text-purple-300 text-xs">לחץ להצגת החלום</span>
//       </div>
//     </motion.button>
//   );
// }

// export default function PopularWeek({ limit = 6 }: { limit?: number }) {
//   const qc = useQueryClient();
//   const { data = [], isLoading } = useQuery({
//     queryKey: ["popular-week", limit],
//     queryFn: () => DreamsApi.getPopular(limit),
//   });

//   // Prefetch חלום מלא כשמרחפים עם העכבר (אופציונלי)
//   const prefetch = (id: string) =>
//     qc.prefetchQuery({
//       queryKey: ["dream", id],
//       queryFn: () => fetch(`/api/dreams/${id}`).then((r) => r.json()),
//     });

//   return (
//     <section className="max-w-7xl mx-auto px-4 mb-16">
//       <div className="mb-8 flex items-center gap-3">
//         <TrendingUp className="w-8 h-8 text-amber-400" />
//         <h2 className="text-3xl font-bold">החלומות הפופולריים השבוע</h2>
//       </div>

//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: limit }).map((_, i) => (
//             <div
//               key={i}
//               className="h-[120px] rounded-xl glass-card border border-purple-500/20 animate-pulse"
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
//           {data.map((row, idx) => (
//             <div key={row.dreamId} onMouseEnter={() => prefetch(row.dreamId)}>
//               <TeaserCard row={row} idx={idx} />
//             </div>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }
