import React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[15px] border border-line dark:border-white/10 bg-white dark:bg-white/5 shadow-[0_3px_14px_rgba(23,63,43,0.05)] p-4',
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const tones: Record<string, string> = {
    default: 'bg-brand-light text-brand dark:bg-white/10 dark:text-brand-light border border-line',
    success: 'bg-[#eaf7ef] text-[#17603d] border border-[#bed4c6] dark:bg-green-900/40 dark:text-green-300 dark:border-transparent',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-transparent',
    danger: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-transparent',
    info: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-transparent'
  };
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', tones[tone], className)}
      {...props}
    />
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full h-2 rounded-full bg-[#e2e9e4] dark:bg-white/10 overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${clamped}%`, background: 'linear-gradient(90deg,#28a66c,#9ddc54)' }}
      />
    </div>
  );
}

export function CircularProgress({ value, size = 92 }: { value: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className="rounded-full grid place-items-center relative shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#b7f36b ${clamped}%, rgba(255,255,255,0.16) 0)`
      }}
    >
      <div
        className="rounded-full grid place-items-center bg-brand-green2 dark:bg-brand-dark"
        style={{ width: size * 0.74, height: size * 0.74 }}
      >
        <b className="relative z-10 text-white" style={{ fontSize: size * 0.23 }}>
          {Math.round(clamped)}%
        </b>
      </div>
    </div>
  );
}

export function EmptyState({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-2">
      <p className="font-semibold text-base">{title}</p>
      {subtitle && <p className="text-sm text-muted max-w-xs">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-black/5 dark:bg-white/10', className)} />;
}

export function Notice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mt-4 border-l-4 border-brand-accent bg-[#fff8e8] dark:bg-amber-900/20 text-[13px] text-black/70 dark:text-amber-200 p-3 rounded-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
