"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { useStudioStore } from "@/lib/store";
import { STUDIO_MODULES } from "@/lib/modules";

export function CommandPalette() {
  const router = useRouter();
  const { isPaletteOpen, setPaletteOpen, togglePalette } = useStudioStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        togglePalette();
        return;
      }
      if (e.metaKey || e.ctrlKey) {
        const mod = STUDIO_MODULES.find((m) => m.shortcut === e.key);
        if (mod) {
          e.preventDefault();
          router.push(mod.path);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, togglePalette]);

  function go(path: string) {
    setPaletteOpen(false);
    router.push(path);
  }

  return (
    <AnimatePresence>
      {isPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[18vh] backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Command palette"
              className="glass overflow-hidden shadow-2xl shadow-black/60"
            >
              <Command.Input
                autoFocus
                placeholder="Where to?"
                className="w-full border-b border-white/5 bg-transparent px-5 py-4 text-base text-text-hi outline-none placeholder:text-text-low"
              />
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-4 py-6 text-center text-sm text-text-low">
                  Nothing matches.
                </Command.Empty>
                {STUDIO_MODULES.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Command.Item
                      key={mod.id}
                      value={`${mod.label} ${mod.description}`}
                      onSelect={() => go(mod.path)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-mid data-[selected=true]:bg-ink-3 data-[selected=true]:text-text-hi"
                    >
                      <Icon size={16} className="text-text-low" />
                      <span>{mod.label}</span>
                      <span className="ml-auto text-xs text-text-low">
                        ⌘{mod.shortcut}
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
