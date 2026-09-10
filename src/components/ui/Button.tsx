import { motion } from 'framer-motion';
import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../utils/helpers';

type ButtonVariant = 'primary' | 'amber' | 'ghost' | 'coral';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'smriti-btn-primary',
  amber: 'smriti-btn-amber',
  ghost: 'smriti-btn-ghost',
  coral: 'smriti-btn-coral',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
  disabled,
  type = 'button',
  ariaLive,
  ariaExpanded,
  ariaPressed,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      aria-live={ariaLive}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      className={cx('smriti-btn', variantClass[variant], size === 'lg' ? 'smriti-btn-lg' : '', className)}
    >
      {children}
    </motion.button>
  );
}
