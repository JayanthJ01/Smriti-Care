import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { cx } from './helpers';

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export function CalmPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={cx('no-horizontal-scroll', className)}
    >
      {children}
    </motion.main>
  );
}
