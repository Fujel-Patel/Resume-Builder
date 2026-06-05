// src/components/ui/Skeleton.tsx
import React, { HTMLAttributes } from "react";
import clsx from "clsx";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton – can be a Tailwind width class (e.g. "w-32") or any CSS value */
  width?: string;
  /** Height of the skeleton – can be a Tailwind height class (e.g. "h-4") or any CSS value */
  height?: string;
  /** Rounded corners – Tailwind class like "rounded", "rounded-full", "rounded-md" */
  rounded?: string;
  /** Optional variant for common UI patterns */
  variant?: "text" | "avatar" | "button" | "image";
}

/**
 * Skeleton placeholder used while real content is loading.
 *
 * The component applies Tailwind's `animate-pulse` and a neutral background.
 * It can be customized via width/height/rounded props or by passing a Tailwind
 * className directly.
 *
 * Example usage:
 *   <Skeleton className="w-32 h-4" />               // generic block
 *   <Skeleton variant="avatar" className="h-10 w-10" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = "rounded",
  className,
  variant,
  ...rest
}) => {
  // Determine sensible defaults based on variant when size is not supplied
  let defaultWidth = "w-full";
  let defaultHeight = "h-4";

  if (variant === "avatar") {
    defaultWidth = "w-10";
    defaultHeight = "h-10";
    rounded = "rounded-full";
  } else if (variant === "button") {
    defaultWidth = "w-24";
    defaultHeight = "h-10";
    rounded = "rounded-md";
  } else if (variant === "image") {
    defaultWidth = "w-full";
    defaultHeight = "h-48";
    rounded = "rounded";
  } else if (variant === "text") {
    defaultWidth = "w-full";
    defaultHeight = "h-4";
    rounded = "rounded";
  }

  const styleClasses = clsx(
    "bg-gray-200 dark:bg-gray-700 animate-pulse",
    width ?? defaultWidth,
    height ?? defaultHeight,
    rounded,
    className,
  );

  return <div className={styleClasses} {...rest} />;
};

export default Skeleton;
