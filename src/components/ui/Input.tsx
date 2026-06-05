import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Input({
  className,
  leftIcon,
  rightIcon,
  size = "md",
  ...props
}: InputProps) {
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-3.5 text-base",
    lg: "h-11 px-4 text-lg",
  }[size];

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-[--text-muted]">
          {leftIcon}
        </div>
      )}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-[--text-muted]">
          {rightIcon}
        </div>
      )}
      <input
        type={props.type ?? "text"}
        className={clsx(
          "w-full rounded-xl bg-[--bg-elevated] border border-[--border] text-[--text-primary]",
          sizeClasses,
          "focus:ring-2 focus-ring-[--color-primary] focus:border-transparent focus:shadow-[0_0_8px_var(--color-primary)] transition-all duration-200 hover:bg-[--bg-elevated]/90",
          disabled && "bg-[--bg-disabled]/50 text-[--text-disabled]",
          className
        )}
        {...props}
      />
    </div>
  );
}