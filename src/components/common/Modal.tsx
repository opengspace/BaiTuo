import { cn } from '@/utils'
import { useEffect, useRef } from 'react'
import { PixelXClose } from '@/components/todo/PixelIcons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={ref}
        className={cn(
          'relative bg-white pixel-border p-6 w-full mx-4',
          'max-h-[85vh] overflow-y-auto',
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-pixel">{title}</h2>
            <button
              onClick={onClose}
              aria-label="关闭"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <PixelXClose className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}