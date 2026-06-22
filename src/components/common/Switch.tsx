import { cn } from '@/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Switch({ checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center pixel-border transition-colors',
        checked ? 'bg-primary-500' : 'bg-gray-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      <span
        className={cn(
          'inline-block h-3 w-3 transform bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
        style={{ boxShadow: '0 0 0 2px #000' }}
      />
    </button>
  )
}