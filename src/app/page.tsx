"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { STUDIO_MODULES } from "@/lib/modules";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.25 + i * 0.06,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function HomePage() {
  const modules = STUDIO_MODULES.filter(
    (m) => m.id !== "home" && m.id !== "settings",
  );

  return (
    <div className="mx-auto max-w-5xl pt-[8vh]">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-3 text-xs font-medium tracking-[0.35em] text-text-low uppercase"
      >
        AI Creative Studio
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="iridescent font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.95] tracking-tight"
      >
        NOCTURNE
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-4 max-w-md text-sm text-text-mid"
      >
        Local-first creative operating system. Images, motion, code and
        prompts — generated, refined and exported from one dark room.
      </motion.p>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
            >
              <Link
                href={mod.path}
                className="panel group block p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_16px_48px_-20px_oklch(62%_0.24_295/0.5)]"
              >
                <Icon
                  size={20}
                  className="text-text-low transition-colors duration-300 group-hover:text-violet"
                />
                <h2 className="mt-4 text-base font-medium text-text-hi">
                  {mod.label}
                </h2>
                <p className="mt-1 text-sm text-text-low">{mod.description}</p>
                <p className="mt-4 text-xs text-text-low opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  ⌘{mod.shortcut}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 text-xs text-text-low"
      >
        Press <kbd className="rounded bg-ink-2 px-1.5 py-0.5">⌘K</kbd> anywhere
      </motion.p>
    </div>
  );
}
