import {
  Sparkles,
  Image as ImageIcon,
  Waves,
  Code2,
  Library,
  Settings,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export interface StudioModule {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  shortcut: string;
  description: string;
}

export const STUDIO_MODULES: readonly StudioModule[] = [
  {
    id: "home",
    label: "Overview",
    path: "/",
    icon: LayoutDashboard,
    shortcut: "1",
    description: "Studio dashboard and recent work",
  },
  {
    id: "image",
    label: "Image Studio",
    path: "/image",
    icon: ImageIcon,
    shortcut: "2",
    description: "Cinematic image generation",
  },
  {
    id: "prompts",
    label: "Prompt Engine",
    path: "/prompts",
    icon: Sparkles,
    shortcut: "3",
    description: "Style presets, enhancement and composition",
  },
  {
    id: "motion",
    label: "Motion Engine",
    path: "/motion",
    icon: Waves,
    shortcut: "4",
    description: "Animated hero backgrounds and loops",
  },
  {
    id: "code",
    label: "Code Generator",
    path: "/code",
    icon: Code2,
    shortcut: "5",
    description: "AI-generated scenes and sections",
  },
  {
    id: "library",
    label: "Library",
    path: "/library",
    icon: Library,
    shortcut: "6",
    description: "All generated assets",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    shortcut: ",",
    description: "API keys and preferences",
  },
] as const;
