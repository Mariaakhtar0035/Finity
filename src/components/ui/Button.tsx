import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white border border-ink hover:bg-ink-soft",
  // "success" is the same high-emphasis action; colour is reserved for tokens
  success: "bg-ink text-white border border-ink hover:bg-ink-soft",
  secondary: "bg-transparent text-ink border border-ink hover:bg-ink/5",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-ink/5",
  danger: "bg-negative text-white border border-negative hover:brightness-95",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none
        transition-[background-color,transform,filter] duration-150 active:scale-[0.98]
        disabled:opacity-40 disabled:active:scale-100
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
