// ── Spinner ───────────────────────────────────────────────────────────────────

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?:      SpinnerSize
  color?:     'mint' | 'white' | 'slate'
  className?: string
  label?:     string
}

const spinnerSize: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const spinnerColor = {
  mint:  'text-mint',
  white: 'text-slate-white',
  slate: 'text-slate',
}

export function Spinner({ size = 'md', color = 'mint', className = '', label }: SpinnerProps) {
  return (
    <span role="status" aria-label={label ?? 'Carregando'} className={`inline-flex ${className}`}>
      <svg
        className={`animate-spin ${spinnerSize[size]} ${spinnerColor[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </span>
  )
}

// ── PageLoader ────────────────────────────────────────────────────────────────

export function PageLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[200px] animate-fade-in">
      <Spinner size="lg" />
      <p className="text-sm text-slate">{label}</p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
  width?:     string
  height?:    string
  rounded?:   'sm' | 'md' | 'lg' | 'full'
}

const roundedClasses = {
  sm:   'rounded',
  md:   'rounded-xl',
  lg:   'rounded-2xl',
  full: 'rounded-full',
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded   = 'md',
}: SkeletonProps) {
  return (
    <div
      className={[
        'bg-gradient-to-r from-navy-light via-slate/10 to-navy-light bg-[length:200%_100%] animate-shimmer',
        roundedClasses[rounded],
        className,
      ].join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-navy-light border border-slate/10 rounded-2xl p-6 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

// ── SkeletonText ──────────────────────────────────────────────────────────────

export function SkeletonText({ lines = 4, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-3/5' : i % 2 === 0 ? 'w-full' : 'w-11/12'}`}
        />
      ))}
    </div>
  )
}
