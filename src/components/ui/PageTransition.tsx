import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

/**
 * Wraps page content to provide a smooth cross‑fade transition when navigating
 * between routes inside the dashboard layout. Uses the current pathname as the
 * animation key so each route change triggers an exit / enter animation.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
