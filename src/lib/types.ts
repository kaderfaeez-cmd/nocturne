export type AssetType = "image" | "code" | "motion";

export interface StudioAsset {
  id: string;
  type: AssetType;
  /** Public URL for images (/generated/…), inline source for code/motion. */
  url: string | null;
  content: string | null;
  prompt: string;
  tags: string[];
  createdAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
