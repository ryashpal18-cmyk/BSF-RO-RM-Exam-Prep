import React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-green2 text-white hover:brightness-95 active:scale-[0.98]',
  secondary: 'bg-[#e6eee9] text-[#174a34] hover:opacity-90 dark:bg-white/10 dark:text-brand-light',
  outline: 'border border-line text-brand dark:text-brand-light dark:border-white/15 hover:bg-brand-light dark:hover:bg-white/5',
  ghost: 'text-brand dark:text-brand-light hover:bg-brand-light dark:hover:bg-white/5',
  destructive: 'bg-red-600 text-white hover:bg-red-700'
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-[10px]',
  lg: 'text-base px-5 py-3 rounded-[10px]',
  icon: 'p-2 rounded-lg'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition disabled:opacity-50 disabled:pointer-events-none select-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
