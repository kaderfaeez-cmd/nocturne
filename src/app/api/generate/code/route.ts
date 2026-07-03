import { NextResponse } from "next/server";
import { generateText, AiConfigError } from "@/lib/server/ai";

const MODES = {
  r3f: `You write production-quality React Three Fiber scenes.
Output a single self-contained component file. Hard rules:
- Imports allowed ONLY from: "react", "@react-three/fiber", "@react-three/drei", "three".
- Export exactly one component: "export default function Scene()".
- The component must render a <Canvas> filling its parent (style width/height 100%).
- Cinematic dark aesthetic: rich lighting, fog or environment where fitting, subtle continuous animation via useFrame.
- No external assets, no textures from URLs, no comments longer than one line.
- Output ONLY the code. No markdown fences, no explanation.`,
  hero: `You write premium landing-page hero sections as React components.
Output a single self-contained component file. Hard rules:
- Imports allowed ONLY from: "react".
- Export exactly one component: "export default function Hero()".
- All styling inline or via a <style> tag inside the component. No Tailwind, no CSS imports.
- Dark luxury cinematic aesthetic: ambient gradients, elegant typography, smooth CSS animations, layered depth.
- Fully responsive. No external assets or fonts.
- Output ONLY the code. No markdown fences, no explanation.`,
} as const;

type Mode = keyof typeof MODES;

export async function POST(request: Request) {
  let body: {
    prompt?: string;
    mode?: string;
    previousCode?: string;
    instruction?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const mode: Mode = body.mode === "hero" ? "hero" : "r3f";
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json(
      { success: false, data: null, error: "Prompt is required." },
      { status: 400 },
    );
  }

  const isRefinement = Boolean(body.previousCode && body.instruction);
  const userPrompt = isRefinement
    ? `Here is the current component:\n\n${body.previousCode}\n\nRevise it with this direction: ${body.instruction}\nKeep all hard rules. Output ONLY the full revised code.`
    : prompt;

  try {
    const raw = await generateText({
      system: MODES[mode],
      prompt: userPrompt,
      maxTokens: 8000,
    });
    // Strip accidental markdown fences defensively.
    const code = raw
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
    return NextResponse.json({ success: true, data: { code, mode }, error: null });
  } catch (err) {
    const isConfig = err instanceof AiConfigError;
    console.error("[/api/generate/code]", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: isConfig
          ? (err as Error).message
          : "Code generation failed. Check server logs.",
      },
      { status: isConfig ? 422 : 500 },
    );
  }
}
