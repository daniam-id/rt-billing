'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// ─── Motion tokens (premium SaaS physics) ──────────────────────────────────
export const EASE = [0.16, 1, 0.3, 1] as const;
export const DUR = { entry: 0.55, micro: 0.18 };

// Scroll reveal wrapper — keeps section files lean
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: DUR.entry, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── CTA button ─────────────────────────────────────────────────────────────
export function CTAButton({
  label,
  href = '/login',
  variant = 'primary',
  className = '',
  icon = true,
}: {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  icon?: boolean;
}) {
  const base =
    'group inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-lg px-6 py-3 transition-colors duration-150';
  const styles =
    variant === 'primary'
      ? 'bg-brand hover:bg-brand-hover text-white'
      : 'bg-canvas hover:bg-surface text-text-primary border border-border';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: DUR.micro, ease: EASE }}
      className="inline-block"
    >
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {label}
        {icon && (
          <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        )}
      </Link>
    </motion.div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  return (
    <Reveal className={`flex flex-col ${alignment} max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand mb-3">
          <span className="w-4 h-px bg-brand" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-text-secondary mt-3 text-base leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
}

// ─── Icon set (clean 1.5px line icons, currentColor) ────────────────────────
type IconProps = { className?: string };
const svg = (className: string, children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {children}
  </svg>
);

export const Droplet = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <path d="M12 3.5c3 3.5 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6.5 6-10Z" />);

export const Receipt = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <><path d="M5 3.5h14v17l-2.5-1.5L14 20.5 11.5 19 9 20.5 6.5 19 5 20.5Z" /><path d="M9 8h6M9 12h6" /></>);

export const Cpu = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <><rect x="6.5" y="6.5" width="11" height="11" rx="2" /><path d="M9.5 9.5h5v5h-5z" /><path d="M9 3.5v3M15 3.5v3M9 17.5v3M15 17.5v3M3.5 9h3M3.5 15h3M17.5 9h3M17.5 15h3" /></>);

export const ShieldCheck = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <><path d="M12 3 5 5.5v5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5v-5L12 3Z" /><path d="m9 11.5 2 2 4-4" /></>);

export const Lock = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <><rect x="5" y="10.5" width="14" height="9" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>);

export const Layers = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>);

export const Gauge = ({ className = 'w-5 h-5' }: IconProps) =>
  svg(className, <><path d="M3.5 16a8.5 8.5 0 1 1 17 0" /><path d="m12 13 4-3.5" /><circle cx="12" cy="13" r="1.2" /></>);

export const ArrowRight = ({ className = 'w-4 h-4' }: IconProps) =>
  svg(className, <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);

export const Check = ({ className = 'w-4 h-4' }: IconProps) =>
  svg(className, <path d="m5 12.5 4 4 10-10" />);

export const Plus = ({ className = 'w-4 h-4' }: IconProps) =>
  svg(className, <><path d="M12 5v14M5 12h14" /></>);

export const Quote = ({ className = 'w-8 h-8' }: IconProps) =>
  svg(className, <path d="M9 7H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3H6m12-9h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3h-2" />);
