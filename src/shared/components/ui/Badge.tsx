import React from 'react'

type BadgeVariant = 'default' | 'mint' | 'golden' | 'red' | 'blue' | 'outline'
type BadgeSize    = 'sm' | 'md' | 'lg'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?:    BadgeSize
  dot?:     boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate/15 text-slate-light border border-slate/20',
  mint:    'bg-mint/15 text-mint border border-mint/25',
  golden:  'bg-golden/15 text-golden border border-golden/25',
  red:     'bg-red-500/15 text-red-400 border border-red-500/25',
  blue:    'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  outline: 'bg-transparent text-slate-white border border-slate/30',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs rounded-md gap-1',
  md: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  lg: 'px-3 py-1.5 text-sm rounded-xl gap-2',
}

export function Badge({
  variant   = 'default',
  size      = 'md',
  dot       = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={[
            'rounded-full shrink-0',
            size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5',
            variant === 'mint'   ? 'bg-mint'
            : variant === 'golden' ? 'bg-golden'
            : variant === 'red'    ? 'bg-red-400'
            : variant === 'blue'   ? 'bg-blue-400'
            : 'bg-slate-light',
          ].join(' ')}
        />
      )}
      {children}
    </span>
  )
}

// ── FormationBadge ─────────────────────────────────────────────────────────────

const FORMATION_LABELS: Record<string, string> = {
  APOSTOLO:    'Apóstolo',
  PROFETA:     'Profeta',
  EVANGELISTA: 'Evangelista',
  PASTOR:      'Pastor',
  MESTRE:      'Mestre',
}

interface FormationBadgeProps {
  formation?: string | null
  size?:      BadgeSize
  className?: string
}

export function FormationBadge({ formation, size = 'md', className = '' }: FormationBadgeProps) {
  if (!formation) return null
  return (
    <Badge variant="mint" size={size} dot className={className}>
      {FORMATION_LABELS[formation] ?? formation}
    </Badge>
  )
}

// ── StatusBadge ────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  published:  { label: 'Publicado',   variant: 'mint' },
  draft:      { label: 'Rascunho',    variant: 'default' },
  scheduled:  { label: 'Agendado',    variant: 'blue' },
  archived:   { label: 'Arquivado',   variant: 'outline' },
  pendente:   { label: 'Pendente',    variant: 'golden' },
  aprovado:   { label: 'Aprovado',    variant: 'mint' },
  rejeitado:  { label: 'Rejeitado',   variant: 'red' },
}

interface StatusBadgeProps {
  status:     string
  size?:      BadgeSize
  className?: string
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const map = STATUS_MAP[status] ?? { label: status, variant: 'default' as BadgeVariant }
  return (
    <Badge variant={map.variant} size={size} dot className={className}>
      {map.label}
    </Badge>
  )
}
