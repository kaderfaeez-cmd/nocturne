export interface StylePreset {
  id: string;
  label: string;
  /** Fragment appended to the subject when composing the final prompt. */
  fragment: string;
  negative: string;
}

export const STYLE_PRESETS: readonly StylePreset[] = [
  {
    id: "cinematic",
    label: "Cinematic Realism",
    fragment:
      "cinematic film still, shot on ARRI Alexa 65, anamorphic lens, shallow depth of field, filmic color grade, subtle film grain, dramatic composition",
    negative: "cartoon, illustration, flat lighting, oversaturated, watermark",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    fragment:
      "cyberpunk aesthetic, neon-drenched night city, holographic signage, rain-slick streets, teal and magenta palette, atmospheric haze, blade-runner mood",
    negative: "daylight, pastel, rustic, low detail",
  },
  {
    id: "luxury",
    label: "Dark Luxury",
    fragment:
      "dark luxury product aesthetic, obsidian surfaces, gold accents, soft rim lighting, premium editorial photography, deep shadows, immaculate minimalism",
    negative: "cluttered, cheap, plastic look, bright white background",
  },
  {
    id: "anime",
    label: "Anime",
    fragment:
      "high-quality anime key visual, crisp lineart, painterly backgrounds, dramatic sky, Makoto Shinkai inspired lighting, vibrant yet balanced palette",
    negative: "photorealistic, 3D render, western cartoon, deformed anatomy",
  },
  {
    id: "studio",
    label: "Studio Photography",
    fragment:
      "professional studio photograph, medium format camera, softbox key light with subtle fill, seamless backdrop, tack-sharp focus, commercial quality",
    negative: "snapshot, harsh flash, motion blur, busy background",
  },
  {
    id: "render3d",
    label: "3D Render",
    fragment:
      "octane render, physically based materials, global illumination, volumetric lighting, 8k detail, smooth studio HDRI reflections",
    negative: "photograph, sketch, low poly, flat shading",
  },
  {
    id: "ui",
    label: "UI Concept",
    fragment:
      "premium dark-mode interface design concept, glassmorphism panels, ambient gradient glow, crisp typography, presented as a polished product screenshot on a dark backdrop",
    negative: "hand-drawn, skeuomorphic clutter, light theme, lorem ipsum walls",
  },
  {
    id: "brand",
    label: "Brand Identity",
    fragment:
      "sophisticated brand identity presentation, minimal logomark, refined typography system, premium mockup on textured paper and dark stone, art-directed flat lay",
    negative: "clip art, generic template, rainbow gradients",
  },
] as const;

export const CAMERA_ANGLES = [
  "eye level",
  "low angle hero shot",
  "high angle",
  "dutch angle",
  "overhead top-down",
  "extreme close-up",
  "wide establishing shot",
  "over-the-shoulder",
  "macro detail",
] as const;

export const LIGHTING_SETUPS = [
  "golden hour",
  "blue hour",
  "neon glow",
  "rembrandt lighting",
  "rim light silhouette",
  "soft overcast",
  "hard noir shadows",
  "candlelit warmth",
  "bioluminescent",
  "volumetric god rays",
] as const;

export function composePrompt(options: {
  subject: string;
  presetId: string | null;
  camera: string | null;
  lighting: string | null;
}): { prompt: string; negative: string } {
  const preset = STYLE_PRESETS.find((p) => p.id === options.presetId);
  const parts = [options.subject.trim()];
  if (preset) parts.push(preset.fragment);
  if (options.camera) parts.push(`${options.camera} camera angle`);
  if (options.lighting) parts.push(`${options.lighting} lighting`);
  return {
    prompt: parts.filter(Boolean).join(", "),
    negative: preset?.negative ?? "",
  };
}
