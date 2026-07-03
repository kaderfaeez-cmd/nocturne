"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Copy, Check, Save, RefreshCcw, Box, Layout } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { buildSandboxDoc } from "@/lib/sandbox";

type Mode = "r3f" | "hero";

export default function CodeGeneratorPage() {
  const [mode, setMode] = useState<Mode>("r3f");
  const [prompt, setPrompt] = useState("");
  const [instruction, setInstruction] = useState("");
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");

  const sandboxDoc = useMemo(
    () => (code ? buildSandboxDoc(code) : ""),
    [code],
  );

  async function generate(refine: boolean) {
    const base = refine ? instruction : prompt;
    if (!base.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          refine
            ? { prompt, mode, previousCode: code, instruction }
            : { prompt, mode },
        ),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setCode(json.data.code);
      setInstruction("");
      setView("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function saveToLibrary() {
    const res = await fetch("/api/assets/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: code,
        prompt: `[${mode}] ${prompt}`,
        tags: ["code", mode],
      }),
    });
    const json = await res.json();
    if (json.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Code Generator"
        title="Describe the scene"
        description="Claude writes the component — 3D scene or hero section — rendered live in an isolated sandbox."
      />

      <div className="glass p-5">
        <div className="mb-3 flex gap-1.5">
          <ModeChip
            active={mode === "r3f"}
            onClick={() => setMode("r3f")}
            icon={<Box size={14} />}
            label="R3F Scene"
          />
          <ModeChip
            active={mode === "hero"}
            onClick={() => setMode("hero")}
            icon={<Layout size={14} />}
            label="Hero Section"
          />
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate(false);
          }}
          rows={3}
          placeholder={
            mode === "r3f"
              ? "A field of floating obsidian monoliths with violet rim light, slow orbital camera…"
              : "Hero for an AI music startup — dark, waveform motif, glowing CTA…"
          }
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-text-hi outline-none placeholder:text-text-low"
        />
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
          <p className="text-xs text-text-low">⌘⏎ to generate</p>
          <Button
            variant="primary"
            onClick={() => generate(false)}
            disabled={!prompt.trim() || isGenerating}
          >
            <Code2 size={15} />
            {isGenerating ? "Writing…" : "Generate"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <AnimatePresence>
        {code && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 pb-16"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <ModeChip
                  active={view === "preview"}
                  onClick={() => setView("preview")}
                  label="Preview"
                />
                <ModeChip
                  active={view === "code"}
                  onClick={() => setView("code")}
                  label="Code"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={copyCode}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button onClick={saveToLibrary}>
                  {saved ? <Check size={15} /> : <Save size={15} />}
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>

            {view === "preview" ? (
              <iframe
                title="Generated component preview"
                sandbox="allow-scripts"
                srcDoc={sandboxDoc}
                className="panel aspect-video w-full"
              />
            ) : (
              <pre className="panel max-h-[60vh] overflow-auto p-5 font-mono text-xs leading-relaxed text-text-mid">
                {code}
              </pre>
            )}

            <div className="glass mt-4 flex items-center gap-3 p-4">
              <input
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") generate(true);
                }}
                placeholder="Refine it — 'make the camera orbit slower, add fog'…"
                className="flex-1 bg-transparent text-sm text-text-hi outline-none placeholder:text-text-low"
              />
              <Button
                onClick={() => generate(true)}
                disabled={!instruction.trim() || isGenerating}
              >
                <RefreshCcw size={15} />
                Refine
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ModeChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

function ModeChip({ active, onClick, label, icon }: ModeChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-150 ${
        active
          ? "bg-violet text-white"
          : "bg-ink-2 text-text-mid hover:bg-ink-3"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
