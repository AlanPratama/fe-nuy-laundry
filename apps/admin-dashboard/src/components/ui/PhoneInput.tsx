import React from 'react'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export const PhoneInput: React.FC<Props> = ({
  value,
  onChange,
  error = false,
  className = '',
  placeholder = '0812-3456-7890',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and hyphen (-)
    const sanitized = e.target.value.replace(/[^\d-]/g, '')
    onChange(sanitized)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const sanitized = pasted.replace(/[^\d-]/g, '')
    onChange(sanitized)
  }

  return (
    <input
      type="text"
      inputMode="tel"
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-2xl text-ink text-sm transition focus:outline-none ${
        error
          ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
          : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
      } ${className}`}
      {...props}
    />
  )
}
