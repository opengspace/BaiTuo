import { cn } from '@/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pixel'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    pixel: 'bg-black text-white font-pixel',
  }

  const isPixel = variant === 'pixel'

  return (
    <span className={cn(
      'px-2 py-0.5 text-xs',
      !isPixel && 'rounded-full',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}