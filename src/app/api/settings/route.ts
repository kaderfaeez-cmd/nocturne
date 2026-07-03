import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/server/config";

function mask(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

export async function GET() {
  const cfg = await readConfig();
  return NextResponse.json({
    success: true,
    data: {
      anthropicApiKey: mask(
        process.env.ANTHROPIC_API_KEY ?? cfg.anthropicApiKey,
      ),
      geminiApiKey: mask(process.env.GEMINI_API_KEY ?? cfg.geminiApiKey),
      hasAnthropic: Boolean(process.env.ANTHROPIC_API_KEY || cfg.anthropicApiKey),
      hasGemini: Boolean(process.env.GEMINI_API_KEY || cfg.geminiApiKey),
      textModel: cfg.textModel,
      imageModel: cfg.imageModel,
    },
    error: null,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const patch: Record<string, string> = {};
  const allowed = [
    "anthropicApiKey",
    "geminiApiKey",
    "textModel",
    "imageModel",
  ] as const;
  for (const field of allowed) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value === "string" && value.trim() !== "") {
      patch[field] = value.trim();
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { success: false, data: null, error: "No valid fields to save." },
      { status: 400 },
    );
  }

  await writeConfig(patch);
  return NextResponse.json({ success: true, data: { saved: true }, error: null });
}
