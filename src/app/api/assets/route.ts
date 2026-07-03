import { NextResponse } from "next/server";
import {
  listAssets,
  deleteAsset,
  updateAssetTags,
} from "@/lib/server/assets";
import type { AssetType } from "@/lib/types";

const VALID_TYPES: AssetType[] = ["image", "code", "motion"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");
  const type = VALID_TYPES.includes(typeParam as AssetType)
    ? (typeParam as AssetType)
    : undefined;
  const assets = await listAssets(type);
  return NextResponse.json({ success: true, data: assets, error: null });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, data: null, error: "Asset id is required." },
      { status: 400 },
    );
  }
  const removed = await deleteAsset(id);
  if (!removed) {
    return NextResponse.json(
      { success: false, data: null, error: "Asset not found." },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: { id }, error: null });
}

export async function PATCH(request: Request) {
  let body: { id?: string; tags?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  if (!body.id || !Array.isArray(body.tags)) {
    return NextResponse.json(
      { success: false, data: null, error: "id and tags[] are required." },
      { status: 400 },
    );
  }
  const tags = body.tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
  const updated = await updateAssetTags(body.id, tags);
  if (!updated) {
    return NextResponse.json(
      { success: false, data: null, error: "Asset not found." },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: updated, error: null });
}
