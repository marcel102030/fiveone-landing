type AvatarSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type AvatarVariant = 'circle' | 'rounded'

interface AvatarProps {
  src?:       string | null
  name?:      string | null
  size?:      AvatarSize
  variant?:   AvatarVariant
  online?:    boolean
  className?: string
  alt?:       string
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; badge: string }> = {
  xs:  { container: 'w-6 h-6',   text: 'text-2xs', badge: 'w-1.5 h-1.5 border' },
  sm:  { container: 'w-8 h-8',   text: 'text-xs',  badge: 'w-2 h-2 border' },
  md:  { container: 'w-10 h-10', text: 'text-sm',  badge: 'w-2.5 h-2.5 border-2' },
  lg:  { container: 'w-12 h-12', text: 'text-base', badge: 'w-3 h-3 border-2' },
  xl:  { container: 'w-16 h-16', text: 'text-xl',  badge: 'w-3.5 h-3.5 border-2' },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl', badge: 'w-4 h-4 border-2' },
}

const variantClasses: Record<AvatarVariant, string> = {
  circle:  'rounded-full',
  rounded: 'rounded-xl',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  name,
  size    = 'md',
  variant = 'circle',
  online,
  className = '',
  alt,
}: AvatarProps) {
  const { container, text, badge } = sizeClasses[size]
  const shape = variantClasses[variant]
  const initials = name ? getInitials(name) : '?'

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={[
          'flex items-center justify-center overflow-hidden select-none',
          container,
          shape,
        ].join(' ')}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={[
              'w-full h-full flex items-center justify-center font-semibold',
              'bg-gradient-to-br from-mint/30 to-mint/10 text-mint',
              text,
            ].join(' ')}
          >
            {initials}
          </div>
        )}
      </div>

      {online !== undefined && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-navy-light',
            badge,
            online ? 'bg-green-400' : 'bg-slate/60',
          ].join(' ')}
          title={online ? 'Online' : 'Offline'}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

// ── AvatarGroup ───────────────────────────────────────────────────────────────

interface AvatarGroupProps {
  avatars:    { src?: string | null; name?: string }[]
  max?:       number
  size?:      AvatarSize
  className?: string
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className = '' }: AvatarGroupProps) {
  const visible  = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visible.map((a, i) => (
        <div key={i} className="ring-2 ring-navy-light rounded-full">
          <Avatar src={a.src} name={a.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={[
            'ring-2 ring-navy-light rounded-full flex items-center justify-center',
            'bg-navy-light text-slate text-xs font-medium',
            sizeClasses[size].container,
          ].join(' ')}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
