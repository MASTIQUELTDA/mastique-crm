import { cn } from '@/lib/utils'
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-lg border text-sm text-[#0B1929] bg-white placeholder:text-[#A0AEC0]',
          'focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]',
          'transition-colors',
          error ? 'border-[#E53E3E]' : 'border-[#DDD9D2]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#E53E3E]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#7A8FA6]">{hint}</p>}
    </div>
  )
}
