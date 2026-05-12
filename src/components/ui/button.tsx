import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-red-700 text-white shadow-sm hover:bg-red-900 hover:shadow-lg dark:bg-red-600 dark:hover:bg-red-500",
        destructive:
          "bg-red-700 text-white hover:bg-red-900 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-500",
        outline:
          "border-2 border-slate-900 bg-transparent text-slate-950 shadow-sm hover:bg-slate-100 dark:border-slate-200 dark:text-slate-100 dark:hover:bg-slate-800",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white",
        ghost:
          "hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-300",
        link: "text-red-700 underline-offset-4 hover:underline dark:text-red-400",
      },
      size: {
        default: "px-5 py-2.5 has-[>svg]:px-4",
        sm: "min-h-9 rounded-md gap-1.5 px-3 py-1.5 has-[>svg]:px-2.5",
        lg: "min-h-12 rounded-lg px-8 py-3 has-[>svg]:px-6",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
