'use client';

import { clsx } from 'clsx';
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const base = 'inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand hover:bg-brand-hover text-white border-brand',
    secondary: 'bg-canvas text-text-primary border-border hover:bg-surface',
    danger: 'bg-canvas text-danger border-border hover:bg-red-50',
    ghost: 'bg-transparent text-text-secondary border-transparent hover:bg-surface',
  };
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full px-3 py-1.5 text-sm border border-border rounded-md bg-canvas text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand',
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...props}
      className={clsx(
        'w-full px-3 py-1.5 text-sm border border-border rounded-md bg-canvas text-text-primary focus:outline-none focus:border-brand',
        props.className
      )}
    />
  );
}

export type BadgeVariant = 'paid' | 'pending' | 'overdue' | 'active' | 'vacant' | 'neutral';
export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-red-50 text-red-700 border-red-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    vacant: 'bg-slate-50 text-slate-600 border-slate-200',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-md', styles[variant])}>
      {children}
    </span>
  );
}

export function Th({ children, className, ...props }: ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return (
    <th
      {...props}
      className={clsx('text-left text-xs font-semibold text-text-secondary uppercase tracking-wide px-3 py-2 border-b border-border bg-surface', className)}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...props }: TdHTMLAttributes<HTMLTableDataCellElement>) {
  return (
    <td {...props} className={clsx('px-3 py-2 border-b border-border text-text-primary', className)}>
      {children}
    </td>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}
