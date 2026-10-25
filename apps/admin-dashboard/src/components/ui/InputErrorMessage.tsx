import React from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  message?: string | null
}

export const InputErrorMessage: React.FC<Props> = ({ message }) => {
  if (!message) return null

  return (
    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
      <span>{message}</span>
    </p>
  )
}
