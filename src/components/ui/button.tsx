import * as React from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'warning'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-cyan-400/35 bg-cyan-300/12 text-cyan-50 shadow-[0_14px_34px_-24px_rgba(34,211,238,0.85)] hover:border-cyan-300/55 hover:bg-cyan-300/18',
  secondary:
    'border border-slate-700/90 bg-slate-900/90 text-slate-100 hover:border-slate-500 hover:bg-slate-900',
  ghost:
    'border border-transparent bg-transparent text-slate-300 hover:border-slate-700/80 hover:bg-slate-900/70 hover:text-white',
  warning:
    'border border-amber-400/30 bg-amber-300/10 text-amber-100 hover:border-amber-300/50 hover:bg-amber-300/14',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-2 text-sm',
  md: 'min-h-10 px-4 py-2.5 text-sm',
  lg: 'min-h-11 px-5 py-3 text-sm',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', type = 'button', asChild = false, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      })
    }

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
