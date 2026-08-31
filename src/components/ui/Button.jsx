import React, { forwardRef } from 'react';

/**
 * Reusable Button component visually matching the Triad modal design.
 *
 * Variants:
 * - 'primary' (default): Vibrant indigo gradient with soft glow shadow (like "Guardar Triada")
 * - 'secondary' / 'outlined': Clean subtle border with dark/light adaptation (like "Cancelar")
 * - 'ghost': Clean borderless button with hover highlight
 * - 'danger': Vibrant red/rose gradient for cancel/reset/destroy actions
 *
 * Sizes:
 * - 'sm': Compact (h-8, px-3, text-xs)
 * - 'md': Standard Triad size (h-10, px-4.5, text-[13px])
 * - 'lg': Prominent (h-12, px-6, text-sm)
 * - 'icon': Square icon button (w-10, h-10)
 * - 'icon-sm': Small square icon button (w-8, h-8)
 */
export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}, ref) => {
  // Base classes: True button affordance (pill/rounded, tangible surface, clear border, shadow, press effect)
  const baseClasses = 'btn-reset inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer transition-all duration-200 outline-none relative overflow-hidden active:scale-[0.97]';

  // Size classes: Generous touch targets and defined padding
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-full',
    md: 'h-9.5 px-4 text-xs gap-2 rounded-full',
    lg: 'h-11 px-5 text-sm gap-2.5 rounded-full',
    icon: 'w-9.5 h-9.5 p-0 rounded-full shrink-0',
    'icon-sm': 'w-8 h-8 p-0 rounded-full shrink-0',
  }[size] || 'h-9.5 px-4 text-xs gap-2 rounded-full';

  // Variant classes: Real button surfaces with contrast, borders, and tactile depth
  const variantClasses = {
    // Primary: Solid vibrant indigo gradient with depth & glow
    primary: `
      bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700
      hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700
      text-white
      border border-indigo-700 dark:border-indigo-500
      shadow-[0_2px_8px_rgba(79,70,229,0.35)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.5)]
    `,
    // Secondary / Outlined: Tangible card button with clear border & hover lift (like CREAR TRIADA)
    secondary: `
      bg-[var(--bg-surface)]
      text-text-primary
      border border-slate-300 dark:border-slate-700
      shadow-xs
      hover:border-indigo-400 dark:hover:border-indigo-400
      hover:text-indigo-600 dark:hover:text-indigo-300
      hover:bg-slate-100 dark:hover:bg-slate-800
    `,
    // Outlined: Clear button border on transparent background
    outlined: `
      bg-transparent
      text-indigo-600 dark:text-indigo-400
      border border-slate-300 dark:border-slate-600
      hover:border-indigo-500 dark:hover:border-indigo-400
      hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40
      shadow-xs hover:shadow-sm
    `,
    // Ghost: Subtle button with active surface
    ghost: `
      bg-transparent
      text-slate-600 dark:text-slate-300
      border border-transparent
      hover:bg-slate-100 dark:hover:bg-slate-800
      hover:text-slate-900 dark:hover:text-white
    `,
    // Danger: Tangible rose gradient button
    danger: `
      bg-gradient-to-r from-rose-600 to-rose-700
      hover:from-rose-500 hover:to-rose-600
      text-white
      border border-rose-700 dark:border-rose-500
      shadow-[0_2px_8px_rgba(225,29,72,0.35)] hover:shadow-[0_4px_14px_rgba(225,29,72,0.5)]
    `,
  }[variant] || '';

  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none filter-none shadow-none active:scale-100'
    : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0 flex items-center justify-center">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0 flex items-center justify-center">{icon}</span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

