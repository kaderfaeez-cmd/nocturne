import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { resolveKeys } from "./config";

/**
 * Provider abstraction. Claude preferred for text when a key exists,
 * Gemini free tier otherwise. Images always via Gemini.
 */

export type TextProvider = "claude" | "gemini";

export interface TextRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
  provider?: TextProvider;
}

export interface ImageResult {
  base64: string;
  mimeType: string;
}

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";

export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

export async function generateText(req: TextRequest): Promise<string> {
  const keys = await resolveKeys();
  const provider: TextProvider =
    req.provider ?? (keys.anthropic ? "claude" : "gemini");

  if (provider === "claude") {
    if (!keys.anthropic) {
      throw new AiConfigError(
        "No Anthropic API key configured. Add one in Settings.",
      );
    }
    const client = new Anthropic({ apiKey: keys.anthropic });
    const msg = await client.messages.create({
      model: keys.textModel,
      max_tokens: req.maxTokens ?? 4096,
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    });
    const block = msg.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("Claude returned no text content.");
    }
    return block.text;
  }

  if (!keys.gemini) {
    throw new AiConfigError(
      "No Gemini API key configured. Add one in Settings.",
    );
  }
  const genai = new GoogleGenAI({ apiKey: keys.gemini });
  const result = await genai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: req.prompt,
    config: {
      systemInstruction: req.system,
      maxOutputTokens: req.maxTokens ?? 4096,
      // Thinking tokens share the output budget on 2.5 models —
      // disable so short maxTokens calls don't come back truncated.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const text = result.text;
  if (!text) {
    throw new Error("Gemini returned no text content.");
  }
  return text;
}

export async function generateImage(prompt: string): Promise<ImageResult> {
  const keys = await resolveKeys();
  let geminiFailure = "no Gemini key configured";

  if (keys.gemini) {
    try {
      return await generateImageGemini(keys.gemini, keys.imageModel, prompt);
    } catch (err) {
      // Free tier often has zero image quota — fall through to the
      // keyless provider instead of failing the request.
      geminiFailure =
        err instanceof Error && /"code":\s*429|RESOURCE_EXHAUSTED/.test(err.message)
          ? "Gemini free tier has no image quota (needs billing)"
          : "Gemini image call failed";
      console.warn("[ai] Falling back to Pollinations:", geminiFailure);
    }
  }

  try {
    return await generateImagePollinations(prompt);
  } catch (err) {
    const pollinationsFailure =
      err instanceof Error ? err.message : "Pollinations failed";
    throw new Error(
      `All image providers unavailable — ${geminiFailure}; Pollinations: ${pollinationsFailure} ` +
        "Retry later, or use a billing-enabled Gemini key.",
    );
  }
}

async function generateImageGemini(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<ImageResult> {
  const genai = new GoogleGenAI({ apiKey });
  const result = await genai.models.generateContent({
    model,
    contents: prompt,
  });

  const parts = result.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }
  const refusal = parts.find((p) => p.text)?.text;
  throw new Error(
    refusal
      ? `Model returned no image: ${refusal.slice(0, 300)}`
      : "Model returned no image data.",
  );
}

/** Free keyless image generation — pollinations.ai (Flux). */
async function generateImagePollinations(prompt: string): Promise<ImageResult> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt.slice(0, 1500),
  )}?width=1216&height=1216&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e9)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) {
    throw new Error(`Pollinations returned ${res.status}.`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1000) {
    throw new Error("Pollinations returned an empty image.");
  }
  return {
    base64: buffer.toString("base64"),
    mimeType: res.headers.get("content-type") ?? "image/jpeg",
  };
}
