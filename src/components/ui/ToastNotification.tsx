import React, { useEffect, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  /** Text shown on the button */
  label: string;
  /** Callback when the button is clicked */
  onClick: () => void;
}

export interface ToastProps {
  /** Unique identifier (optional, used by providers) */
  id?: string | number;
  /** Message to display */
  message: string;
  /** Visual variant */
  variant?: ToastVariant;
  /** Auto‑dismiss after this many milliseconds; defaults to 4000ms. Ignored for "error" variant unless explicitly set. */
  duration?: number;
  /** Optional action button */
  action?: ToastAction;
  /** Called when the toast is dismissed (by timer or user) */
  onClose: () => void;
}

/**
 * ToastNotification – a single toast UI element.
 *
 * Features:
 *  - Variants: success, error, warning, info (different Tailwind colors)
 *  - Positioning is handled by a container (see ToastContainer below) – this component only provides
 *    the visual representation.
 *  - Auto‑dismiss after 4 seconds for non‑error toasts.
 *  - Persistent for error toasts unless a custom duration is supplied.
 *  - Optional action button (e.g., undo, retry).
 *  - ARIA live region support for screen‑readers.
 */
export const ToastNotification: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 4000,
  action,
  onClose,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hovered, setHovered] = useState(false);

  // Determine if we should auto‑dismiss
  const shouldAutoDismiss = variant !== 'error' || duration !== undefined;

  useEffect(() => {
    if (!shouldAutoDismiss) return;
    // Start timer only when not hovered
    if (!hovered) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }
    // Cleanup on unmount or when hovered changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hovered, shouldAutoDismiss, duration, onClose]);

  // Pause timer on hover
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  const baseClasses =
    'flex items-center w-80 max-w-full rounded-md shadow-md p-4 text-sm transition-opacity duration-200';

  const variantClasses: Record<ToastVariant, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-400 text-black',
    info: 'bg-blue-600 text-white',
  };

  const ariaLive = variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      aria-atomic="true"
      className={`${baseClasses} ${variantClasses[variant]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="flex-1">{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="ml-2 rounded px-2 py-0.5 text-xs font-medium hover:bg-white/20"
        >
          {action.label}
        </button>
      )}
      {/* Close (X) button */}
      <button
        type="button"
        onClick={onClose}
        className="ml-2 rounded-full p-1 hover:bg-white/20 focus:outline-none"
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * ToastContainer – positions toasts according to the specification:
 *   • Mobile (default) – top‑center
 *   • Desktop (min‑width 768px) – bottom‑right
 * The container simply renders its children and applies responsive positioning.
 */
export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className={
        // Mobile: top‑center
        'fixed top-4 left-1/2 -translate-x-1/2 flex flex-col space-y-2 z-50' +
        // Desktop: bottom‑right
        ' md:bottom-4 md:top-auto md:left-auto md:right-4 md:translate-x-0 md:transform-none md:flex-col-reverse md:space-y-reverse'
      }
    >
      {children}
    </div>
  );
};
