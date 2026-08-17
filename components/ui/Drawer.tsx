'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}

const widths = { sm: 'w-[420px]', md: 'w-[520px]', lg: 'w-[640px]' }

export function Drawer({ open, onClose, title, subtitle, children, width = 'md', footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 z-40 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        'fixed top-0 right-0 h-full bg-white z-50 flex flex-col shadow-2xl',
        'transition-transform duration-300 ease-out',
        widths[width],
        open ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#DDD9D2] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#0B1929]">{title}</h2>
            {subtitle && <p className="text-sm text-[#7A8FA6] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F4F2EE] text-[#7A8FA6] hover:text-[#0B1929] transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-[#DDD9D2] bg-[#F4F2EE]/50">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
