import { promises as fs } from "fs";
import path from "path";

/**
 * Local-only key/preference store. Lives in .nocturne/ (gitignored),
 * never leaves this machine.
 */

export interface StudioConfig {
  anthropicApiKey: string;
  geminiApiKey: string;
  textModel: string;
  imageModel: string;
}

const CONFIG_DIR = path.join(process.cwd(), ".nocturne");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: StudioConfig = {
  anthropicApiKey: "",
  geminiApiKey: "",
  textModel: "claude-sonnet-5",
  imageModel: "gemini-2.5-flash-image",
};

export async function readConfig(): Promise<StudioConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function writeConfig(
  patch: Partial<StudioConfig>,
): Promise<StudioConfig> {
  const current = await readConfig();
  const next = { ...current, ...patch };
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

/** Resolved keys: env vars win over stored config. */
export async function resolveKeys(): Promise<{
  anthropic: string;
  gemini: string;
  textModel: string;
  imageModel: string;
}> {
  const cfg = await readConfig();
  return {
    anthropic: process.env.ANTHROPIC_API_KEY ?? cfg.anthropicApiKey,
    gemini: process.env.GEMINI_API_KEY ?? cfg.geminiApiKey,
    textModel: cfg.textModel,
    imageModel: cfg.imageModel,
  };
}
