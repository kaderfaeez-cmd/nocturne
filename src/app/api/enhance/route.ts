import { NextResponse } from "next/server";
import { generateText, AiConfigError } from "@/lib/server/ai";

const SYSTEM = `You are a world-class prompt director for AI image generation, specialized in cinematic, luxurious, emotionally immersive visuals.

Rewrite the user's raw prompt into a single masterful generation prompt. Rules:
- Keep the user's core subject and intent exactly.
- Add concrete visual specifics: composition, camera, lens, lighting, materials, atmosphere, color palette.
- Respect any style direction given; deepen it rather than replacing it.
- One paragraph, no lists, no preamble, no quotes. Maximum 120 words.
- Output ONLY the rewritten prompt.`;

export async function POST(request: Request) {
  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json(
      { success: false, data: null, error: "Prompt is required." },
      { status: 400 },
    );
  }
  if (prompt.length > 4000) {
    return NextResponse.json(
      { success: false, data: null, error: "Prompt too long (max 4000 chars)." },
      { status: 400 },
    );
  }

  try {
    const enhanced = await generateText({
      system: SYSTEM,
      prompt,
      maxTokens: 500,
    });
    return NextResponse.json({
      success: true,
      data: { enhanced: enhanced.trim() },
      error: null,
    });
  } catch (err) {
    const isConfig = err instanceof AiConfigError;
    console.error("[/api/enhance]", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: isConfig
          ? (err as Error).message
          : "Enhancement failed. Check server logs.",
      },
      { status: isConfig ? 422 : 500 },
    );
  }
}
