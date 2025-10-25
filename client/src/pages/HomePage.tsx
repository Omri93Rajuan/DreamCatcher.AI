import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DreamCard from "@/components/dreams/DreamCard";
import DreamInterpretation from "@/components/dreams/DreamInterpretation";
import StatsPanel from "@/components/dreams/StatsPanel";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [newDream, setNewDream] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [currentInterpretation, setCurrentInterpretation] = useState<{
    dream_text: string;
    interpretation: string;
  } | null>(null);
  const qc = useQueryClient();

  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ["dreams"],
    queryFn: () => DreamsApi.list({ sort: "-createdAt" }),
    initialData: [],
  });

  const createDream = useMutation({
    mutationFn: (payload: Partial<Dream>) => DreamsApi.create(payload as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dreams"] }),
  });

  const handleInterpretDream = async () => {
    if (!newDream.trim()) return;
    setIsInterpreting(true);
    setCurrentInterpretation(null);

    try {
      const { title: suggested, aiResponse } = await DreamsApi.interpret({
        userInput: newDream,
      });
      const finalTitle = (title || suggested || "חלום ללא כותרת").slice(0, 80);

      await createDream.mutateAsync({
        title: finalTitle,
        userInput: newDream,
        aiResponse,
        isShared: false,
        sharedAt: null,
      });

      setCurrentInterpretation({
        dream_text: newDream,
        interpretation: aiResponse,
      });
      setNewDream("");
      setTitle("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsInterpreting(false);
    }
  };

  const filtered = searchQuery
    ? dreams.filter(
        (d) =>
          d.title.includes(searchQuery) ||
          d.userInput.includes(searchQuery) ||
          d.aiResponse.includes(searchQuery)
      )
    : dreams;

  const popular = filtered.slice(0, 6);
  const recent = [...filtered]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-20">
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              גלה את המשמעות של החלומות שלך
            </h1>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              פענח את החלומות שלך באמצעות בינה מלאכותית מתקדמת
            </p>
          </motion.div>

          <div className="grid gap-3 max-w-3xl mx-auto mb-10">
            <Input
              placeholder="כותרת (לא חובה)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="relative">
              <Search className="absolute right-4 top-3 w-5 h-5 text-purple-400" />
              <Textarea
                value={newDream}
                onChange={(e) => setNewDream(e.target.value)}
                placeholder="תאר/י את החלום שלך..."
                className="pr-10"
                disabled={isInterpreting}
              />
            </div>
            <Button
              onClick={handleInterpretDream}
              disabled={!newDream.trim() || isInterpreting}
              className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold py-3 rounded-xl glow-effect disabled:opacity-50"
            >
              {isInterpreting ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  מפענח...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  פענח לי את החלום
                </>
              )}
            </Button>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute right-4 top-3 w-5 h-5 text-purple-400" />
              <Input
                placeholder="חפש/י חלום..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {currentInterpretation && (
          <section className="max-w-6xl mx-auto px-4 mb-20">
            <DreamInterpretation interpretation={currentInterpretation} />
          </section>
        )}
      </AnimatePresence>

      <section className="max-w-7xl mx-auto px-4 mb-20">
        <StatsPanel dreams={dreams} />
      </section>

      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-amber-400" />
          <h2 className="text-3xl font-bold">החלומות הפופולריים ביותר</h2>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popular.map((dream, i) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <DreamCard dream={dream} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold">חלומות אחרונים</h2>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recent.map((dream, i) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <DreamCard dream={dream} showDate />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
