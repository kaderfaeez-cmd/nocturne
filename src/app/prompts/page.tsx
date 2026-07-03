"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, ImageIcon, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import {
  STYLE_PRESETS,
  CAMERA_ANGLES,
  LIGHTING_SETUPS,
  composePrompt,
} from "@/lib/prompt-presets";

export default function PromptsPage() {
  const router = useRouter();
  const setDraftPrompt = useStudioStore((s) => s.setDraftPrompt);

  const [subject, setSubject] = useState("");
  const [presetId, setPresetId] = useState<string | null>("cinematic");
  const [camera, setCamera] = useState<string | null>(null);
  const [lighting, setLighting] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const composed = useMemo(
    () => composePrompt({ subject, presetId, camera, lighting }),
    [subject, presetId, camera, lighting],
  );

  const finalPrompt = enhanced || composed.prompt;

  async function enhance() {
    if (!subject.trim()) return;
    setIsEnhancing(true);
    setError("");
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: composed.prompt }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEnhanced(json.data.enhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed.");
    } finally {
      setIsEnhancing(false);
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function sendToImageStudio() {
    setDraftPrompt(finalPrompt);
    router.push("/image");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Prompt Engine"
        title="Compose the shot"
        description="Subject + style + camera + light. Enhance with AI, then send straight to the Image Studio."
      />

      <div className="panel space-y-6 p-6">
        <div>
          <label className="text-sm font-medium text-text-hi">Subject</label>
          <textarea
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setEnhanced("");
            }}
            rows={3}
            placeholder="A lone astronaut walking through a neon market on a rain-soaked exoplanet…"
            className="mt-2 w-full resize-none rounded-[10px] border border-white/8 bg-ink-0 px-3.5 py-3 text-sm text-text-hi outline-none placeholder:text-text-low focus:border-violet/60"
          />
        </div>

        <ChipRow
          label="Style"
          options={STYLE_PRESETS.map((p) => ({ id: p.id, label: p.label }))}
          selected={presetId}
          onSelect={(id) => {
            setPresetId(id === presetId ? null : id);
            setEnhanced("");
          }}
        />
        <ChipRow
          label="Camera"
          options={CAMERA_ANGLES.map((c) => ({ id: c, label: c }))}
          selected={camera}
          onSelect={(id) => {
            setCamera(id === camera ? null : id);
            setEnhanced("");
          }}
        />
        <ChipRow
          label="Lighting"
          options={LIGHTING_SETUPS.map((l) => ({ id: l, label: l }))}
          selected={lighting}
          onSelect={(id) => {
            setLighting(id === lighting ? null : id);
            setEnhanced("");
          }}
        />

        <div className="flex gap-2 border-t border-white/5 pt-5">
          <Button
            variant="primary"
            onClick={enhance}
            disabled={!subject.trim() || isEnhancing}
          >
            <Sparkles size={15} />
            {isEnhancing ? "Directing…" : "Enhance with AI"}
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <AnimatePresence>
        {finalPrompt && subject.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass mt-4 p-6"
          >
            <p className="mb-2 text-xs font-medium tracking-[0.2em] text-text-low uppercase">
              {enhanced ? "AI-directed prompt" : "Composed prompt"}
            </p>
            <p className="text-sm leading-relaxed text-text-hi">
              {finalPrompt}
            </p>
            {composed.negative && !enhanced && (
              <p className="mt-3 text-xs text-text-low">
                Negative: {composed.negative}
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <Button onClick={copyPrompt}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="primary" onClick={sendToImageStudio}>
                <ImageIcon size={15} />
                Send to Image Studio
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ChipRowProps {
  label: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}

function ChipRow({ label, options, selected, onSelect }: ChipRowProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text-hi">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`rounded-full px-3 py-1.5 text-xs transition-all duration-150 ${
              selected === opt.id
                ? "bg-violet text-white shadow-[0_0_16px_-4px_var(--violet)]"
                : "bg-ink-2 text-text-mid hover:bg-ink-3 hover:text-text-hi"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
