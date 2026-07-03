"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, Trash2, X, Columns2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import type { StudioAsset } from "@/lib/types";

export default function ImageStudioPage() {
  const draftPrompt = useStudioStore((s) => s.draftPrompt);
  const setDraftPrompt = useStudioStore((s) => s.setDraftPrompt);

  const [prompt, setPrompt] = useState("");
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<StudioAsset | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  useEffect(() => {
    if (draftPrompt) {
      setPrompt(draftPrompt);
      setDraftPrompt("");
    }
  }, [draftPrompt, setDraftPrompt]);

  const loadAssets = useCallback(async () => {
    const res = await fetch("/api/assets?type=image");
    const json = await res.json();
    if (json.success) setAssets(json.data);
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  async function generate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAssets((prev) => [json.data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelected(null);
    setCompareIds((prev) => prev.filter((c) => c !== id));
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      return [...prev.slice(-1), id];
    });
  }

  const compareAssets = assets.filter((a) => compareIds.includes(a.id));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Image Studio"
        title="Generate the frame"
        description="Gemini image generation, saved straight to your local library."
        actions={
          <Button
            onClick={() => {
              setIsCompareMode((v) => !v);
              setCompareIds([]);
            }}
          >
            <Columns2 size={15} />
            {isCompareMode ? "Exit compare" : "Compare"}
          </Button>
        }
      />

      <div className="glass p-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
          }}
          rows={3}
          placeholder="Describe the frame — or compose one in the Prompt Engine first…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-text-hi outline-none placeholder:text-text-low"
        />
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
          <p className="text-xs text-text-low">⌘⏎ to generate</p>
          <Button
            variant="primary"
            onClick={generate}
            disabled={!prompt.trim() || isGenerating}
          >
            <Wand2 size={15} />
            {isGenerating ? "Rendering…" : "Generate"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="panel mt-6 flex aspect-video max-w-md items-center justify-center overflow-hidden"
        >
          <div className="iridescent font-display text-lg">
            developing the negative…
          </div>
        </motion.div>
      )}

      {isCompareMode && compareAssets.length === 2 && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {compareAssets.map((a) => (
            <figure key={a.id} className="panel overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url ?? ""} alt={a.prompt} className="w-full" />
              <figcaption className="p-3 text-xs text-text-low">
                {a.prompt.slice(0, 120)}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 pb-16 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence>
          {assets.map((asset) => (
            <motion.button
              key={asset.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() =>
                isCompareMode ? toggleCompare(asset.id) : setSelected(asset)
              }
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                compareIds.includes(asset.id)
                  ? "border-violet shadow-[0_0_24px_-8px_var(--violet)]"
                  : "border-white/6 hover:border-white/15"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url ?? ""}
                alt={asset.prompt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="line-clamp-2 text-left text-xs text-white/90">
                  {asset.prompt}
                </p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {assets.length === 0 && !isGenerating && (
        <p className="mt-10 text-center text-sm text-text-low">
          Nothing generated yet. The first frame is waiting.
        </p>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass max-h-full max-w-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.url ?? ""}
                alt={selected.prompt}
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="flex items-start justify-between gap-4 p-5">
                <p className="text-sm leading-relaxed text-text-mid">
                  {selected.prompt}
                </p>
                <div className="flex shrink-0 gap-2">
                  <a href={selected.url ?? "#"} download>
                    <Button>
                      <Download size={15} />
                    </Button>
                  </a>
                  <Button variant="danger" onClick={() => remove(selected.id)}>
                    <Trash2 size={15} />
                  </Button>
                  <Button onClick={() => setSelected(null)}>
                    <X size={15} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
