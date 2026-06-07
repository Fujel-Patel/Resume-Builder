// src/components/ui/FullPageLoader.tsx
import React, { ReactNode } from "react";
import clsx from "clsx";

/**
 * Full‑page overlay that shows a loading spinner while the app's initial data is being fetched.
 *
 * Props:
 *   - children: the underlying page/content (rendered underneath the overlay when not loading)
 *   - isLoading: boolean flag to toggle the overlay
 *   - overlayClassName: optional Tailwind classes for custom overlay styling
 */
export const FullPageLoader: React.FC<{
  isLoading: boolean;
  children: ReactNode;
  overlayClassName?: string;
}> = ({ isLoading, children, overlayClassName }) => {
  return (
    <div className="relative min-h-screen">
      {children}
      {isLoading && (
        <div
          className={clsx(
            "absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70",
            overlayClassName,
          )}
        >
          {/* Simple spinner – you can replace with a better SVG if desired */}
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default FullPageLoader;
