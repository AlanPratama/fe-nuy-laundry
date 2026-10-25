/**
 * Utility to resolve image URLs stored in backend/MinIO or provided as local data/blob URLs.
 */
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

  const baseUrl = ((import.meta.env.VITE_API_URL as string) || 'http://localhost:8080').replace(/\/+$/, '')
  let cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  if (cleanPath.startsWith('api/v1/files/')) {
    cleanPath = cleanPath.slice('api/v1/files/'.length)
  }
  return `${baseUrl}/api/v1/files/${cleanPath}`
}
