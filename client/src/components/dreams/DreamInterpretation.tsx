import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Search } from "lucide-react";
import { DreamsApi } from "@/lib/api/dreams";
import type { Dream } from "@/lib/api/types";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import SharePromptDialog from "@/components/dreams/SharePromptDialog";
import { useAuthStore } from "@/stores/useAuthStore";

type Props = {
  onInterpreted?: (payload: {
    dream_text: string;
    interpretation: string;
    dream?: Dream | null;
  }) => void;
};

export default function InterpretForm({ onInterpreted }: Props) {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState("");
  const [newDream, setNewDream] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [lastDream, setLastDream] = useState<Dream | null>(null);
  const { user } = useAuthStore();

  const requireAuth = () => {
    if (!user) {
      setAuthOpen(true);
      return false;
    }
    return true;
  };

  const handleInterpret = async () => {
    if (!newDream.trim()) return;
    if (!requireAuth()) return;
    setIsInterpreting(true);
    try {
      const resp = await DreamsApi.interpret({
        text: newDream,
        save: true,
        titleOverride: title || undefined,
        isShared: false,
      });
      const dream = resp.dream!;
      setLastDream(dream);
      onInterpreted?.({
        dream_text: dream.userInput,
        interpretation: dream.aiResponse,
        dream,
      });
      setTitle("");
      setNewDream("");
      setShareOpen(true);
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <>
      <div className="grid gap-3 max-w-3xl mx-auto mb-10" dir={i18n.dir()}>
        <Input
          placeholder={t("interpret.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="relative">
          <Search className="absolute right-4 top-3 w-5 h-5 text-purple-400" />
          <Textarea
            value={newDream}
            onChange={(e) => setNewDream(e.target.value)}
            placeholder={t("interpret.placeholder")}
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
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />{" "}
              {t("interpret.submitting")}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 ml-2" /> {t("interpret.cta")}
            </>
          )}
        </Button>
      </div>

      <AuthGateDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="signup"
        onSuccess={() => setAuthOpen(false)}
      />

      <SharePromptDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        dream={lastDream}
        onShared={(updated: Dream) => setLastDream(updated)}
      />
    </>
  );
}
