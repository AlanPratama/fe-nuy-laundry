export function resolveImageUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') return ''
  const trimmed = path.trim()
  if (!trimmed) return ''

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }

  const baseUrl = 'http://localhost:8080'
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  return `${baseUrl}/api/v1/files/${cleanPath}`
}
