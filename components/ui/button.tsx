import { ButtonHTMLAttributes } from "react"
import cn from "classnames"

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "bg-orange-500 text-white hover:bg-orange-600",
        "h-9 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

