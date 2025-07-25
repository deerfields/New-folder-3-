import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const classes = `flex h-11 min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition ${className}`
    
    return (
      <input
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input } 