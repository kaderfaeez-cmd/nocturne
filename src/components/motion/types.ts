export interface MotionParams {
  /** Primary hue 0-360 */
  hueA: number;
  /** Secondary hue 0-360 */
  hueB: number;
  /** 0.1 – 3, multiplier on animation speed */
  speed: number;
  /** 0 – 1, visual density / intensity */
  intensity: number;
}

export const DEFAULT_PARAMS: MotionParams = {
  hueA: 285,
  hueB: 200,
  speed: 1,
  intensity: 0.6,
};

export interface MotionPresetDef {
  id: string;
  label: string;
  description: string;
}

export const MOTION_PRESETS: readonly MotionPresetDef[] = [
  {
    id: "aurora",
    label: "Aurora",
    description: "Slow-drifting luminous gradient veils",
  },
  {
    id: "particles",
    label: "Particle Field",
    description: "Constellation of linked drifting points",
  },
  {
    id: "waves",
    label: "Signal Waves",
    description: "Layered glowing sine ribbons",
  },
  {
    id: "grid",
    label: "Horizon Grid",
    description: "Retro-futurist perspective grid pulse",
  },
] as const;
