import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Search } from "lucide-react";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";

type Props = {
  onInterpreted?: (payload: {
    dream_text: string;
    interpretation: string;
  }) => void;
};

export default function InterpretForm({ onInterpreted }: Props) {
  const [title, setTitle] = useState("");
  const [newDream, setNewDream] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const qc = useQueryClient();

  const createDream = useMutation({
    mutationFn: (payload: Partial<Dream>) => DreamsApi.create(payload as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dreams"] }),
  });

  const handleInterpret = async () => {
    if (!newDream.trim()) return;
    setIsInterpreting(true);
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

      onInterpreted?.({ dream_text: newDream, interpretation: aiResponse });
      setTitle("");
      setNewDream("");
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
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
        onClick={handleInterpret}
        disabled={!newDream.trim() || isInterpreting}
        className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold py-3 rounded-xl glow-effect disabled:opacity-50"
      >
        {isInterpreting ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" /> מפענח...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 ml-2" /> פענח לי את החלום
          </>
        )}
      </Button>
    </div>
  );
}
