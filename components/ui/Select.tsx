import { cn } from '@/lib/utils'
import { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-3 py-2 rounded-lg border text-sm text-[#0B1929] bg-white',
          'focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]',
          'transition-colors appearance-none',
          error ? 'border-[#E53E3E]' : 'border-[#DDD9D2]',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-[#E53E3E]">{error}</p>}
    </div>
  )
}
