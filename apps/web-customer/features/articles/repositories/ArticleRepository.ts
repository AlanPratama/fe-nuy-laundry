import type { ArticleCategory, ArticleItem, ArticleDetail } from '../models/ArticleModel'

export interface IArticleRepository {
  getAll(category?: ArticleCategory): Promise<ArticleItem[]>
  getBySlug(slug: string): Promise<ArticleDetail | null>
}

export class ArticleRepository implements IArticleRepository {
  private apiBase: string

  constructor(apiBase = 'http://localhost:8080') {
    this.apiBase = apiBase
  }

  private normalizeCategory(cat: string): string {
    const upper = (cat || '').toUpperCase()
    if (upper === 'TIPS_PERAWATAN' || upper.includes('PERAWATAN')) return 'Tips Perawatan'
    if (upper === 'PANDUAN_BAHAN' || upper.includes('BAHAN')) return 'Panduan Bahan'
    if (upper === 'INFO_PROMO' || upper.includes('PROMO')) return 'Info & Promo'
    if (upper === 'INFO_MENARIK' || upper.includes('MENARIK')) return 'Info Menarik'
    return cat || 'Tips Perawatan'
  }

  private mapBackendToArticle(raw: any): ArticleDetail {
    const rawThumb = raw.thumbnailUrl || ''
    const thumb = rawThumb.startsWith('http') 
      ? rawThumb 
      : rawThumb ? `${this.apiBase}/api/v1/files/${rawThumb}` : ''

    let formattedDate = 'Hari ini'
    if (raw.publishedAt || raw.createdAt) {
      try {
        formattedDate = new Date(raw.publishedAt || raw.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      } catch {}
    }

    return {
      id: String(raw.id || ''),
      slug: String(raw.slug || ''),
      title: String(raw.title || ''),
      excerpt: String(raw.excerpt || ''),
      category: this.normalizeCategory(raw.category),
      readingTime: String(raw.readingTime || '3 menit baca'),
      author: String(raw.authorName || 'Tim Ahli Nuy Laundry'),
      publishedAt: formattedDate,
      thumbnailUrl: thumb,
      content: String(raw.content || '')
    }
  }

  async getAll(category: ArticleCategory = 'Semua'): Promise<ArticleItem[]> {
    try {
      const res = await fetch(`${this.apiBase}/api/v1/articles?isPublished=true&size=50`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        const json = await res.json()
        const items = json?.data?.content
        if (Array.isArray(items)) {
          const mapped = items.map((i: any) => this.mapBackendToArticle(i))
          if (category === 'Semua') {
            return mapped.map(({ content, relatedSlugs, ...rest }) => rest)
          }
          return mapped
            .filter(a => a.category.toLowerCase() === category.toLowerCase())
            .map(({ content, relatedSlugs, ...rest }) => rest)
        }
      }
    } catch (err) {
      console.error('Failed to fetch articles from backend:', err)
    }

    return []
  }

  async getBySlug(slug: string): Promise<ArticleDetail | null> {
    try {
      const res = await fetch(`${this.apiBase}/api/v1/articles/${encodeURIComponent(slug)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        const json = await res.json()
        if (json?.data) {
          return this.mapBackendToArticle(json.data)
        }
      }
    } catch (err) {
      console.error('Failed to fetch article detail by slug:', err)
    }

    return null
  }
}
