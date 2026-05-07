// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Gold-filled primary button
        default:
          "bg-gold text-studio-black hover:bg-gold-light font-semibold tracking-wide rounded-sm",
        // Gold-outlined ghost
        outline:
          "border border-gold text-gold hover:bg-gold hover:text-studio-black rounded-sm",
        // Subtle ghost
        ghost:
          "text-mist hover:text-cream hover:bg-studio-dark rounded-sm",
        // Destructive
        destructive:
          "bg-red-900 text-cream hover:bg-red-800 rounded-sm",
        // Secondary dark panel
        secondary:
          "bg-studio-dark text-cream border border-studio-border hover:border-gold/50 rounded-sm",
        // Completely invisible
        link:
          "text-gold underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8  px-3 text-xs",
        lg:      "h-12 px-8 text-base tracking-widest uppercase",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
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
