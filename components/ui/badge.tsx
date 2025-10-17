/**
 * Badge Component
 * For tags, status indicators, and labels
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default: "border-transparent bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900",
        secondary: "border-transparent bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50",
        success: "border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400",
        danger: "border-transparent bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-400",
        info: "border-transparent bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400",
        outline: "text-neutral-950 dark:text-neutral-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

