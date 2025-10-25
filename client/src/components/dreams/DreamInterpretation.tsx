import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DreamInterpretation({
  interpretation,
}: {
  interpretation: { dream_text: string; interpretation: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card border-amber-500/30 glow-effect">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">הפרשנות מוכנה!</h2>
              <p className="text-purple-300 text-sm">
                קרא/י בעיון את הפענוח שלך
              </p>
            </div>
          </div>

          <div className="mb-6 p-6 glass-card rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-lg text-white">החלום שלך:</h3>
            </div>
            <p className="text-purple-100 leading-relaxed text-lg">
              {interpretation.dream_text}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-2xl text-amber-300">הפרשנות:</h3>
            </div>
            <div className="text-white leading-relaxed text-lg whitespace-pre-line">
              {interpretation.interpretation}
            </div>
          </div>

          <div className="mt-6 p-4 glass-card rounded-lg border border-purple-500/20 text-center text-sm text-purple-300">
            💫 זכור/זכרי: הפרשנות היא כלי לחקירה עצמית — האינטואיציה שלך חשובה
            לא פחות.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
