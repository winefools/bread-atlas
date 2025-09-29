import { LabelHTMLAttributes } from "react"
import cn from "classnames"

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm text-gray-700", className)} {...props} />
}

