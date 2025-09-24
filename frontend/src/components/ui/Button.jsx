import { forwardRef } from "react"

const Button = forwardRef(({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
  const baseClass = "btn"
  const variantClass = `btn-${variant}`
  const sizeClass = size !== "default" ? `btn-${size}` : ""

  const buttonClass = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()

  return (
    <button className={buttonClass} ref={ref} {...props}>
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button }
