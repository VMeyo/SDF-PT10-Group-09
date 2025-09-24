import { forwardRef } from "react"

const Input = forwardRef(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm placeholder-muted-foreground focus-visible-outline-none focus-visible-ring-2 focus-visible-ring-offset-2 disabled-cursor-not-allowed disabled-opacity-50 file-border-0 file-bg-transparent file-text-sm file-font-medium ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
