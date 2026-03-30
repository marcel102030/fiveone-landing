import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-mint text-navy font-semibold hover:bg-mint/90 shadow-mint hover:shadow-mint-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-mint/60',
  secondary: 'bg-navy-light text-slate-white border border-slate/20 hover:border-mint/40 hover:text-mint hover:bg-mint/5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-mint/40',
  outline:   'bg-transparent text-mint border border-mint/40 hover:border-mint hover:bg-mint/5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-mint/40',
  ghost:     'bg-transparent text-slate-light hover:text-mint hover:bg-mint/10 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-mint/30',
  danger:    'bg-red-600/90 text-white hover:bg-red-600 border border-red-500/30 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500/50',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-4 py-2 text-sm rounded-xl gap-2',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center',
        'font-medium transition-all duration-200',
        'outline-none ring-offset-navy ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 w-4 h-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      {children}

      {!loading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  )
}
