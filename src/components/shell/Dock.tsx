"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { STUDIO_MODULES } from "@/lib/modules";

export function Dock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Studio modules"
      className="glass fixed top-1/2 left-3 z-40 flex -translate-y-1/2 flex-col gap-1 p-2"
    >
      {STUDIO_MODULES.map((mod) => {
        const isActive =
          mod.path === "/" ? pathname === "/" : pathname.startsWith(mod.path);
        const Icon = mod.icon;
        return (
          <Link
            key={mod.id}
            href={mod.path}
            title={`${mod.label} (⌘${mod.shortcut})`}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-150 hover:bg-ink-3"
          >
            {isActive && (
              <motion.span
                layoutId="dock-active"
                className="absolute inset-0 rounded-xl bg-ink-3"
                style={{
                  boxShadow: "inset 0 0 0 1px oklch(100% 0 0 / 0.1)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon
              size={19}
              className={`relative transition-colors duration-150 ${
                isActive
                  ? "text-violet"
                  : "text-text-low group-hover:text-text-mid"
              }`}
            />
            <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-ink-2 px-2.5 py-1 text-xs whitespace-nowrap text-text-mid opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {mod.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
