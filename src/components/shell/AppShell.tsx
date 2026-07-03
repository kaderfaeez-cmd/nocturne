"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AmbientBackground } from "./AmbientBackground";
import { Dock } from "./Dock";
import { CommandPalette } from "./CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-dvh">
      <AmbientBackground />
      <Dock />
      <CommandPalette />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="ml-[76px] h-dvh overflow-y-auto px-8 py-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
