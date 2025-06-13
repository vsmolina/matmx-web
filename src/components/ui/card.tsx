import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-white text-black shadow-md dark:bg-zinc-900 dark:text-white",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 border-b", className)} {...props} />
)
CardHeader.displayName = "CardHeader"

const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
)
CardTitle.displayName = "CardTitle"

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...props} />
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
