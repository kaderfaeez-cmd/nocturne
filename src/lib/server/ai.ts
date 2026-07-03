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
  if (!keys.gemini) {
    throw new AiConfigError(
      "No Gemini API key configured. Add one in Settings.",
    );
  }
  const genai = new GoogleGenAI({ apiKey: keys.gemini });
  const result = await genai.models.generateContent({
    model: keys.imageModel,
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
