import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-mono text-[12px] tracking-[0.02em] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--btn-bg)] text-[var(--text-muted)] border border-[var(--border)] hover:text-foreground hover:border-[var(--border-hover)]",
        destructive:
          "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 dark:text-red-400",
        outline:
          "bg-transparent text-[var(--text-muted)] border border-[var(--border)] hover:text-foreground hover:border-[var(--border-hover)]",
        secondary:
          "bg-[var(--btn-bg)] text-foreground border border-[var(--border)] hover:border-[var(--border-hover)]",
        ghost: "text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--btn-bg)]",
        link: "text-[var(--link-color)] underline-offset-4 hover:underline hover:text-[var(--link-hover)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
