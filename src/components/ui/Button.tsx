"use client";

import { forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-violet text-white shadow-[0_0_24px_-6px_var(--violet)] hover:brightness-110 active:scale-[0.98]",
  ghost:
    "bg-ink-2 text-text-mid hover:bg-ink-3 hover:text-text-hi active:scale-[0.98]",
  danger: "bg-danger/15 text-danger hover:bg-danger/25 active:scale-[0.98]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "ghost", className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      />
    );
  },
);
