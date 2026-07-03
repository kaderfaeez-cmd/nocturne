"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

interface SettingsData {
  anthropicApiKey: string;
  geminiApiKey: string;
  hasAnthropic: boolean;
  hasGemini: boolean;
  textModel: string;
  imageModel: string;
}

export default function SettingsPage() {
  const [current, setCurrent] = useState<SettingsData | null>(null);
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    const res = await fetch("/api/settings");
    const json = await res.json();
    if (json.success) setCurrent(json.data);
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anthropicApiKey: anthropicKey,
          geminiApiKey: geminiKey,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAnthropicKey("");
      setGeminiKey("");
      setStatus("saved");
      await loadSettings();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Keys are stored in .nocturne/config.json on this machine only — never committed, never sent anywhere except the provider itself."
      />

      <div className="panel space-y-6 p-6">
        <KeyField
          label="Anthropic API key"
          hint="Powers prompt enhancement and code generation (Claude)."
          configured={current?.hasAnthropic ?? false}
          maskedValue={current?.anthropicApiKey ?? ""}
          value={anthropicKey}
          onChange={setAnthropicKey}
        />
        <KeyField
          label="Gemini API key"
          hint="Powers image generation (free tier) and text fallback."
          configured={current?.hasGemini ?? false}
          maskedValue={current?.geminiApiKey ?? ""}
          value={geminiKey}
          onChange={setGeminiKey}
        />

        <div className="flex items-center gap-3 border-t border-white/5 pt-5">
          <Button
            variant="primary"
            onClick={save}
            disabled={status === "saving" || (!anthropicKey && !geminiKey)}
          >
            {status === "saving" ? "Saving…" : "Save keys"}
          </Button>
          {status === "saved" && (
            <span className="text-sm text-cyan">Saved.</span>
          )}
          {status === "error" && (
            <span className="text-sm text-danger">Save failed.</span>
          )}
        </div>
      </div>

      {current && (
        <div className="panel mt-4 p-6 text-sm text-text-mid">
          <p>
            Text model: <code className="text-text-hi">{current.textModel}</code>
          </p>
          <p className="mt-1">
            Image model:{" "}
            <code className="text-text-hi">{current.imageModel}</code>
          </p>
        </div>
      )}
    </div>
  );
}

interface KeyFieldProps {
  label: string;
  hint: string;
  configured: boolean;
  maskedValue: string;
  value: string;
  onChange: (v: string) => void;
}

function KeyField({
  label,
  hint,
  configured,
  maskedValue,
  value,
  onChange,
}: KeyFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-hi">{label}</label>
        {configured ? (
          <span className="rounded-full bg-cyan/10 px-2.5 py-0.5 text-xs text-cyan">
            configured {maskedValue}
          </span>
        ) : (
          <span className="rounded-full bg-ink-3 px-2.5 py-0.5 text-xs text-text-low">
            not set
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-text-low">{hint}</p>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={configured ? "Replace key…" : "Paste key…"}
        className="mt-2 w-full rounded-[10px] border border-white/8 bg-ink-0 px-3.5 py-2.5 text-sm text-text-hi outline-none placeholder:text-text-low focus:border-violet/60"
      />
    </div>
  );
}
