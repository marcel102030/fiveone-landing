import React from 'react'

type CardVariant = 'default' | 'glass' | 'bordered' | 'elevated'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:   CardVariant
  hoverable?: boolean
  padding?:   'none' | 'sm' | 'md' | 'lg'
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-navy-light border border-slate/10',
  glass:    'bg-navy-light/60 backdrop-blur-sm border border-slate/10',
  bordered: 'bg-navy-light border border-mint/20 shadow-mint',
  elevated: 'bg-navy-light border border-slate/10 shadow-card',
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function Card({
  variant   = 'default',
  hoverable = false,
  padding   = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hoverable
          ? 'cursor-pointer hover:border-mint/30 hover:shadow-card-hover hover:-translate-y-0.5'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

// ── CardHeader ────────────────────────────────────────────────────────────────

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?:    string
  subtitle?: string
  action?:   React.ReactNode
}

export function CardHeader({ title, subtitle, action, children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
      <div className="flex-1 min-w-0">
        {title    && <h3 className="text-base font-semibold text-slate-white leading-tight">{title}</h3>}
        {subtitle && <p className="text-sm text-slate mt-0.5 leading-snug">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── CardDivider ───────────────────────────────────────────────────────────────

export function CardDivider({ className = '' }: { className?: string }) {
  return <hr className={`border-slate/10 my-4 ${className}`} />
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:     string
  value:     string | number
  icon?:     React.ReactNode
  trend?:    { value: number; positive?: boolean }
  className?: string
}

export function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <Card variant="glass" className={`group ${className}`} hoverable>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate uppercase tracking-wider">{label}</p>
        {icon && (
          <span className="text-mint/60 group-hover:text-mint transition-colors text-lg">
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-white">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 font-medium ${trend.positive !== false ? 'text-mint' : 'text-red-400'}`}>
          {trend.positive !== false ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}
    </Card>
  )
}
