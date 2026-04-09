import React from 'react'

// ── Label ────────────────────────────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ required, children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-slate-light mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-mint ml-1">*</span>}
    </label>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?:   string
  hint?:    string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, hint, leftIcon, rightIcon, className = '', ...props }, ref) {
    return (
      <div className="relative flex flex-col gap-1">
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={[
              'w-full bg-navy-light border rounded-xl py-2.5 text-slate-white placeholder-slate/60',
              'transition-all duration-200 outline-none',
              'focus:border-mint/60 focus:shadow-mint focus:bg-navy-light/80',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-500/60 focus:border-red-400 focus:shadow-none'
                : 'border-slate/20',
              leftIcon  ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              'text-sm',
              className,
            ].join(' ')}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-slate">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1 animate-fade-in">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-slate">{hint}</p>
        )}
      </div>
    )
  }
)

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  hint?:  string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, hint, className = '', ...props }, ref) {
    return (
      <div className="flex flex-col gap-1">
        <textarea
          ref={ref}
          className={[
            'w-full bg-navy-light border rounded-xl px-4 py-2.5 text-sm text-slate-white placeholder-slate/60',
            'transition-all duration-200 outline-none resize-none',
            'focus:border-mint/60 focus:shadow-mint',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-slate/20',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 animate-fade-in">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-slate">{hint}</p>
        )}
      </div>
    )
  }
)

// ── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  hint?:  string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ error, hint, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <select
        className={[
          'w-full bg-navy-light border rounded-xl px-4 py-2.5 text-sm text-slate-white',
          'transition-all duration-200 outline-none appearance-none',
          'focus:border-mint/60 focus:shadow-mint',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500/60' : 'border-slate/20',
          className,
        ].join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-navy">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-navy">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 animate-fade-in">{error}</p>}
      {!error && hint && <p className="text-xs text-slate">{hint}</p>}
    </div>
  )
}

// ── FormField ─────────────────────────────────────────────────────────────────

interface FormFieldProps {
  label?:     string
  required?:  boolean
  htmlFor?:   string
  error?:     string
  hint?:      string
  children:   React.ReactNode
  className?: string
}

export function FormField({
  label,
  required,
  htmlFor,
  error,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 animate-fade-in">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-slate">{hint}</p>}
    </div>
  )
}
