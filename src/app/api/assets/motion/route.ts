import { NextResponse } from "next/server";
import { saveTextAsset } from "@/lib/server/assets";

export async function POST(request: Request) {
  let body: { content?: string; prompt?: string; tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body.content?.trim() || !body.prompt?.trim()) {
    return NextResponse.json(
      { success: false, data: null, error: "content and prompt are required." },
      { status: 400 },
    );
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Library persistence is local-only. Use Copy instead.",
      },
      { status: 501 },
    );
  }

  const asset = await saveTextAsset({
    type: "motion",
    content: body.content,
    prompt: body.prompt,
    tags: Array.isArray(body.tags)
      ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 12)
      : [],
  });
  return NextResponse.json({ success: true, data: asset, error: null });
}
