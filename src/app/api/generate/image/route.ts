import { NextResponse } from "next/server";
import { generateImage, AiConfigError } from "@/lib/server/ai";
import { saveImageAsset } from "@/lib/server/assets";

export async function POST(request: Request) {
  let body: { prompt?: string; tags?: string[] };
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
  if (prompt.length > 6000) {
    return NextResponse.json(
      { success: false, data: null, error: "Prompt too long (max 6000 chars)." },
      { status: 400 },
    );
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 12)
    : [];

  try {
    const image = await generateImage(prompt);

    // Vercel's filesystem is read-only — return an ephemeral data-URL
    // asset instead of persisting to disk.
    if (process.env.VERCEL) {
      return NextResponse.json({
        success: true,
        data: {
          id: crypto.randomUUID(),
          type: "image",
          url: `data:${image.mimeType};base64,${image.base64}`,
          content: null,
          prompt,
          tags,
          createdAt: new Date().toISOString(),
        },
        error: null,
      });
    }

    const asset = await saveImageAsset({
      base64: image.base64,
      mimeType: image.mimeType,
      prompt,
      tags,
    });
    return NextResponse.json({ success: true, data: asset, error: null });
  } catch (err) {
    const isConfig = err instanceof AiConfigError;
    console.error("[/api/generate/image]", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: isConfig
          ? (err as Error).message
          : err instanceof Error
            ? err.message
            : "Image generation failed.",
      },
      { status: isConfig ? 422 : 500 },
    );
  }
}
