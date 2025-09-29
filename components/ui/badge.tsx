import { HTMLAttributes } from "react"
import cn from "classnames"

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        "border-gray-200 bg-gray-50 text-gray-700",
        className
      )}
      {...props}
    />
  )
}

