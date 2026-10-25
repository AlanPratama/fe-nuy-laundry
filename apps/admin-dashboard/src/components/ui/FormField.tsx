import React from 'react'
import { InputErrorMessage } from './InputErrorMessage'

interface Props {
  label: string
  sublabel?: string
  required?: boolean
  error?: string | null
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<Props> = ({
  label,
  sublabel,
  required = false,
  error,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-ink uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {sublabel && (
          <span className="text-[11px] text-ink-soft">{sublabel}</span>
        )}
      </div>

      {children}

      <InputErrorMessage message={error} />
    </div>
  )
}
