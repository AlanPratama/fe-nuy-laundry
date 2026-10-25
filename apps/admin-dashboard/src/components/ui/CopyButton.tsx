import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  iconSize?: number
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  className = '',
  iconSize = 14
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Tersalin ke clipboard!' : `Salin ${label || text}`}
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-lg transition-all active:scale-95 ${
        copied
          ? 'bg-emerald-50 text-emerald-600 font-semibold'
          : 'text-ink-soft hover:text-brand-600 hover:bg-brand-50'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check style={{ width: iconSize, height: iconSize }} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-600">Disalin</span>
        </>
      ) : (
        <>
          <Copy style={{ width: iconSize, height: iconSize }} />
          {label && <span className="text-xs">{label}</span>}
        </>
      )}
    </button>
  )
}
