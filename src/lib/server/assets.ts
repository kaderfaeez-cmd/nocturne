import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { StudioAsset, AssetType } from "@/lib/types";

/**
 * Local asset store: files under public/generated/, index in
 * .nocturne/assets.json. Everything stays on this machine.
 */

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");
const INDEX_PATH = path.join(process.cwd(), ".nocturne", "assets.json");

async function readIndex(): Promise<StudioAsset[]> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(assets: StudioAsset[]): Promise<void> {
  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify(assets, null, 2), "utf-8");
}

export async function listAssets(type?: AssetType): Promise<StudioAsset[]> {
  const assets = await readIndex();
  const filtered = type ? assets.filter((a) => a.type === type) : assets;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveImageAsset(options: {
  base64: string;
  mimeType: string;
  prompt: string;
  tags?: string[];
}): Promise<StudioAsset> {
  const id = randomUUID();
  const ext = options.mimeType === "image/jpeg" ? "jpg" : "png";
  const fileName = `${id}.${ext}`;
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await fs.writeFile(
    path.join(GENERATED_DIR, fileName),
    Buffer.from(options.base64, "base64"),
  );

  const asset: StudioAsset = {
    id,
    type: "image",
    url: `/generated/${fileName}`,
    content: null,
    prompt: options.prompt,
    tags: options.tags ?? [],
    createdAt: new Date().toISOString(),
  };
  const assets = await readIndex();
  await writeIndex([asset, ...assets]);
  return asset;
}

export async function saveTextAsset(options: {
  type: Exclude<AssetType, "image">;
  content: string;
  prompt: string;
  tags?: string[];
}): Promise<StudioAsset> {
  const asset: StudioAsset = {
    id: randomUUID(),
    type: options.type,
    url: null,
    content: options.content,
    prompt: options.prompt,
    tags: options.tags ?? [],
    createdAt: new Date().toISOString(),
  };
  const assets = await readIndex();
  await writeIndex([asset, ...assets]);
  return asset;
}

export async function updateAssetTags(
  id: string,
  tags: string[],
): Promise<StudioAsset | null> {
  const assets = await readIndex();
  const index = assets.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const updated = { ...assets[index], tags };
  const next = [...assets.slice(0, index), updated, ...assets.slice(index + 1)];
  await writeIndex(next);
  return updated;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const assets = await readIndex();
  const target = assets.find((a) => a.id === id);
  if (!target) return false;
  if (target.url) {
    const filePath = path.join(process.cwd(), "public", target.url);
    try {
      await fs.unlink(filePath);
    } catch {
      // File already gone — index cleanup still proceeds.
    }
  }
  await writeIndex(assets.filter((a) => a.id !== id));
  return true;
}
