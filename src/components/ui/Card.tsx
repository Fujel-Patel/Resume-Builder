import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: "none" | "low" | "medium" | "high" | "dialog";
}

export default function Card({
  children,
  className,
  elevation = "medium",
}: CardProps) {
  const elevationClasses = {
    none: "shadow-none",
    low: "shadow-sm",
    medium: "shadow-md",
    high: "shadow-lg",
    dialog: "shadow-xl",
  }[elevation];

  return (
    <div
      className={`
        bg-[--bg-surface] border border-[--border] rounded-2xl
        ${elevationClasses}
        hover:shadow-md transition-shadow duration-200
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
}