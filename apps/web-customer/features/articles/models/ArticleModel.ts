export type ArticleCategory = 'Semua' | 'Tips Perawatan' | 'Panduan Bahan' | 'Info & Promo' | 'Info Menarik' | string

export interface ArticleItem {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  readingTime: string
  author: string
  publishedAt: string
  thumbnailUrl: string
}

export interface ArticleDetail extends ArticleItem {
  content: string
  relatedSlugs?: string[]
}
