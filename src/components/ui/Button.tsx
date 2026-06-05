import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline" | "link";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

function sizeClasses(size: ButtonSize) {
  switch (size) {
    case "sm":
      return "px-4 py-2.5 text-sm";
    case "lg":
      return "px-6 py-3 text-base";
    case "md":
    default:
      return "px-6 py-2.5 text-sm";
  }
}

function variantClasses(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return "rounded-xl bg-white/[0.06] text-white border border-white/[0.12] hover:bg-white/[0.10]";
    case "ghost":
      return "rounded-xl bg-transparent text-white hover:bg-white/[0.08]";
    case "destructive":
      return "rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/20";
    case "outline":
      return "rounded-xl border border-white/[0.2] bg-transparent text-white hover:bg-white/[0.05]";
    case "link":
      return "rounded-xl bg-transparent text-white underline-offset-4 hover:underline hover:underline-offset-2";
    case "primary":
    default:
      return "relative rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40";
  }
}

function handleRipple(e: React.MouseEvent<HTMLButtonElement>) {
  // Only ripple for primary-like buttons that are gradient & solid.
  const btn = e.currentTarget;
  const size = Math.max(btn.offsetWidth, btn.offsetHeight);
  const x = e.clientX - btn.getBoundingClientRect().left - size / 2;
  const y = e.clientY - btn.getBoundingClientRect().top - size / 2;

  const ripple = document.createElement("span");
  ripple.style.cssText = `
    position:absolute; width:${size}px; height:${size}px;
    left:${x}px; top:${y}px;
    background:rgba(255,255,255,0.3);
    border-radius:50%; transform:scale(0);
    animation:ripple 500ms linear; pointer-events:none;
  `;
  btn.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 520);
}

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  disabled,
  onClick,
  type,
  loading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      disabled={disabled || loading}
      onClick={(e) => {
        if (disabled || loading) return;
        if (variant === "primary" && !props.disableRipple) handleRipple(e);
        onClick?.(e);
      }}
      className={clsx(
        "inline-flex items-center gap-2 justify-center transition-all duration-200 ease-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 focus-ring-offset-background",
        sizeClasses(size),
        variantClasses(variant),
        disabled && "opacity-50 cursor-not-allowed",
        loading && "pointer-events-none opacity-70",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {props.children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

// Allow opt-out without changing public API elsewhere
declare module "react" {
  interface ButtonHTMLAttributes<T> {
    disableRipple?: boolean;
  }
}