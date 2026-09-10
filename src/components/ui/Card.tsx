import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cardVariants } from '../../utils/motion';
import { cx } from '../../utils/helpers';

interface Props {
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'cream' | 'pine' | 'sky' | 'peach' | 'mint' | 'lav' | 'sun';
  delay?: number;
}

export default function Card({ children, className, tone = 'white', delay = 0 }: Props) {
  const toneClass =
    tone === 'pine'
      ? 'smriti-card-pine'
      : tone === 'cream'
        ? 'smriti-card-cream'
        : tone === 'sky'
          ? 'smriti-card-sky'
          : tone === 'peach'
            ? 'smriti-card-peach'
            : tone === 'mint'
              ? 'smriti-card-mint'
              : tone === 'lav'
                ? 'smriti-card-lav'
                : tone === 'sun'
                  ? 'smriti-card-sun'
                  : 'smriti-card';
  return (
    <motion.section
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' as unknown as string }}
      transition={{ delay }}
      className={cx(toneClass, 'p-5 sm:p-6', className)}
    >
      {children}
    </motion.section>
  );
}
