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
    'border border-cyan-800 bg-cyan-800 text-white shadow-[0_14px_30px_-20px_rgba(14,116,144,0.7)] hover:border-cyan-900 hover:bg-cyan-900',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  ghost:
    'border border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950',
  warning:
    'border border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-2 text-sm',
  md: 'min-h-10 px-4 py-2.5 text-sm',
  lg: 'min-h-11 px-5 py-3 text-sm',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', type = 'button', asChild = false, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
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
