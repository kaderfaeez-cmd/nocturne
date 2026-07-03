"use client";

/**
 * Ambient studio backdrop: two slow-drifting radial glows.
 * Pure CSS transforms — compositor-only, no JS per frame.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, oklch(45% 0.2 295) 0%, transparent 70%)",
          animation: "drift-a 26s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -right-1/4 -bottom-1/3 h-[70vh] w-[70vh] rounded-full opacity-15 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, oklch(60% 0.12 210) 0%, transparent 70%)",
          animation: "drift-b 32s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes drift-a {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(12vw, 8vh) scale(1.15); }
        }
        @keyframes drift-b {
          from { transform: translate(0, 0) scale(1.1); }
          to { transform: translate(-10vw, -6vh) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
