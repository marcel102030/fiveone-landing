import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  open:          boolean
  onClose:       () => void
  title?:        string
  description?:  string
  size?:         ModalSize
  closeOnBackdrop?: boolean
  hideCloseBtn?:    boolean
  children:      React.ReactNode
  footer?:       React.ReactNode
  className?:    string
}

const sizeClasses: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-[95vw] max-h-[95vh]',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size            = 'md',
  closeOnBackdrop = true,
  hideCloseBtn    = false,
  children,
  footer,
  className       = '',
}: ModalProps) {
  // Fechar com ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full bg-navy-light border border-slate/15 rounded-2xl shadow-card',
          'flex flex-col max-h-[90vh] animate-fade-in-up',
          sizeClasses[size],
          className,
        ].join(' ')}
      >
        {/* Header */}
        {(title || !hideCloseBtn) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate/10 shrink-0">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-white leading-tight">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-slate mt-1">{description}</p>
              )}
            </div>
            {!hideCloseBtn && (
              <button
                onClick={onClose}
                className="shrink-0 text-slate hover:text-slate-white transition-colors p-1 rounded-lg hover:bg-slate/10"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-slate/10 p-6 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open:          boolean
  onClose:       () => void
  onConfirm:     () => void
  title:         string
  description?:  string
  confirmLabel?: string
  cancelLabel?:  string
  danger?:       boolean
  loading?:      boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  danger       = false,
  loading      = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-light rounded-xl border border-slate/20 hover:border-mint/30 hover:text-mint transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={[
              'px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50',
              danger
                ? 'bg-red-600/90 text-white hover:bg-red-600 border border-red-500/30'
                : 'bg-mint text-navy hover:bg-mint/90 shadow-mint',
            ].join(' ')}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex gap-4">
        <div className={[
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          danger ? 'bg-red-500/15' : 'bg-mint/15',
        ].join(' ')}>
          {danger ? (
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-slate-white">{title}</h3>
          {description && <p className="text-sm text-slate mt-1">{description}</p>}
        </div>
      </div>
    </Modal>
  )
}
