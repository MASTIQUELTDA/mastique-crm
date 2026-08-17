import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'inactive'

const variants: Record<Variant, string> = {
  default:  'bg-[#E8EDF2] text-[#3A5A78]',
  success:  'bg-[#E6F4EC] text-[#1A6B35]',
  warning:  'bg-[#FFF3CD] text-[#7A4F00]',
  danger:   'bg-[#FDE8E8] text-[#8B1A1A]',
  info:     'bg-[#E0EDFF] text-[#1A3E7A]',
  inactive: 'bg-[#EDEDE8] text-[#7A7A6A]',
}

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
