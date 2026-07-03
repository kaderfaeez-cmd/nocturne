"use client";

import { useState } from "react";
import { Copy, Check, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_PARAMS,
  MOTION_PRESETS,
  type MotionParams,
} from "@/components/motion/types";
import { Aurora, auroraSource } from "@/components/motion/backgrounds/Aurora";
import {
  ParticleField,
  particleFieldSource,
} from "@/components/motion/backgrounds/ParticleField";
import { Waves, wavesSource } from "@/components/motion/backgrounds/Waves";
import {
  HorizonGrid,
  horizonGridSource,
} from "@/components/motion/backgrounds/HorizonGrid";

const RENDERERS: Record<string, React.ComponentType<MotionParams>> = {
  aurora: Aurora,
  particles: ParticleField,
  waves: Waves,
  grid: HorizonGrid,
};

const SOURCES: Record<string, (p: MotionParams) => string> = {
  aurora: auroraSource,
  particles: particleFieldSource,
  waves: wavesSource,
  grid: horizonGridSource,
};

export default function MotionPage() {
  const [presetId, setPresetId] = useState("aurora");
  const [params, setParams] = useState<MotionParams>(DEFAULT_PARAMS);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const Renderer = RENDERERS[presetId];
  const preset = MOTION_PRESETS.find((p) => p.id === presetId);

  function setParam<K extends keyof MotionParams>(
    key: K,
    value: MotionParams[K],
  ) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  async function copyCode() {
    await navigator.clipboard.writeText(SOURCES[presetId](params));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function saveToLibrary() {
    const res = await fetch("/api/assets/motion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: SOURCES[presetId](params),
        prompt: `${preset?.label ?? presetId} — hue ${params.hueA}/${params.hueB}, speed ${params.speed}, intensity ${params.intensity}`,
        tags: ["motion", presetId],
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
        eyebrow="Motion Engine"
        title="Animated backgrounds"
        description="Real-time GPU-friendly hero backgrounds. Tune, preview, export as a drop-in React component."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="panel relative aspect-video overflow-hidden">
          <Renderer {...params} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="font-display text-4xl tracking-tight text-white/85 drop-shadow-lg">
              Your hero here
            </p>
          </div>
        </div>

        <aside className="panel space-y-5 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-text-hi">Preset</p>
            <div className="flex flex-wrap gap-1.5">
              {MOTION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  title={p.description}
                  className={`rounded-full px-3 py-1.5 text-xs transition-all duration-150 ${
                    presetId === p.id
                      ? "bg-violet text-white"
                      : "bg-ink-2 text-text-mid hover:bg-ink-3"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Hue A"
            min={0}
            max={360}
            step={1}
            value={params.hueA}
            onChange={(v) => setParam("hueA", v)}
          />
          <Slider
            label="Hue B"
            min={0}
            max={360}
            step={1}
            value={params.hueB}
            onChange={(v) => setParam("hueB", v)}
          />
          <Slider
            label="Speed"
            min={0.1}
            max={3}
            step={0.1}
            value={params.speed}
            onChange={(v) => setParam("speed", v)}
          />
          <Slider
            label="Intensity"
            min={0}
            max={1}
            step={0.05}
            value={params.intensity}
            onChange={(v) => setParam("intensity", v)}
          />

          <div className="space-y-2 border-t border-white/5 pt-4">
            <Button variant="primary" className="w-full" onClick={copyCode}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied component" : "Copy component code"}
            </Button>
            <Button className="w-full" onClick={saveToLibrary}>
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? "Saved" : "Save to library"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

function Slider({ label, min, max, step, value, onChange }: SliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-text-mid">{label}</span>
        <span className="text-text-low">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--violet)]"
      />
    </div>
  );
}
