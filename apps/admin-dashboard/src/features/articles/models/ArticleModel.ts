export type ArticleCategory = 'TIPS_PERAWATAN' | 'PANDUAN_BAHAN' | 'INFO_PROMO' | 'INFO_MENARIK' | string

export interface ArticleItem {
  id: string
  title: string
  slug: string
  category: ArticleCategory
  excerpt?: string
  content: string
  readingTime?: string
  thumbnailUrl?: string
  isPublished: boolean
  authorId?: string
  authorName?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateArticlePayload {
  title: string
  category: string
  excerpt?: string
  content: string
  readingTime?: string
  isPublished?: boolean
  file?: File
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {
  removeThumbnail?: boolean
}

export interface ArticleQueryParams {
  page?: number
  size?: number
  search?: string
  category?: string
  isPublished?: boolean
  sortBy?: 'createdAt' | 'title' | 'publishedAt'
  direction?: 'asc' | 'desc'
}

export interface ArticleMetrics {
  total: number
  published: number
  draft: number
}
