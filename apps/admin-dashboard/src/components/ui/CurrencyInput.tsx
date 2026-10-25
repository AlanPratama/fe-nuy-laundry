import React from 'react'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  error?: boolean
}

export const CurrencyInput: React.FC<Props> = ({
  value,
  onChange,
  error = false,
  className = '',
  placeholder = '0',
  ...props
}) => {
  // Format numeric value to Indonesian thousand separator
  const displayValue = value ? value.toLocaleString('id-ID') : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digit characters
    const cleanDigits = e.target.value.replace(/\D/g, '')
    const numericValue = cleanDigits ? parseInt(cleanDigits, 10) : 0
    onChange(numericValue)
  }

  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 text-xs font-bold text-ink-soft select-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3 rounded-2xl text-ink text-sm font-semibold transition focus:outline-none ${
          error
            ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
            : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
        } ${className}`}
        {...props}
      />
    </div>
  )
}
