import { apiClient } from '../../../shared/api/apiClient'
import type { ApiResponse, PageResponse } from '@nuy-laundry/shared-types'
import type { 
  ArticleItem, 
  CreateArticlePayload, 
  UpdateArticlePayload, 
  ArticleQueryParams 
} from '../models/ArticleModel'

export interface ArticlePageResult {
  content: ArticleItem[]
  totalElements: number
  totalPages: number
}

export interface IArticleRepository {
  getAll(params?: ArticleQueryParams): Promise<ArticlePageResult>
  getByIdOrSlug(idOrSlug: string): Promise<ArticleItem>
  create(payload: CreateArticlePayload): Promise<ArticleItem>
  update(id: string, payload: UpdateArticlePayload): Promise<ArticleItem>
  delete(id: string): Promise<void>
  togglePublish(id: string): Promise<ArticleItem>
  uploadContentImage(file: File): Promise<string>
}

export class ArticleRepository implements IArticleRepository {

  private normalizeArticle(raw: any): ArticleItem {
    return {
      id: String(raw.id || ''),
      title: String(raw.title || ''),
      slug: String(raw.slug || ''),
      category: String(raw.category || 'TIPS_PERAWATAN'),
      excerpt: raw.excerpt || '',
      content: raw.content || '',
      readingTime: raw.readingTime || '2 menit baca',
      thumbnailUrl: raw.thumbnailUrl || undefined,
      isPublished: Boolean(raw.isPublished),
      authorId: raw.authorId || undefined,
      authorName: raw.authorName || 'Admin Outlet',
      publishedAt: raw.publishedAt || undefined,
      createdAt: raw.createdAt || undefined,
      updatedAt: raw.updatedAt || undefined
    }
  }

  async getAll(params?: ArticleQueryParams): Promise<ArticlePageResult> {
    const page = params?.page ?? 0
    const size = params?.size ?? 10

    try {
      const res = await apiClient.get<ApiResponse<PageResponse<any>>>('/api/v1/articles', {
        params: {
          page,
          size,
          search: params?.search || undefined,
          category: (params?.category && params.category !== 'ALL') ? params.category : undefined,
          isPublished: params?.isPublished !== undefined ? params.isPublished : undefined,
          sortBy: params?.sortBy || 'createdAt',
          direction: params?.direction || 'desc'
        }
      })

      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        const content = res.data.data.content.map(this.normalizeArticle)
        const totalElements = res.data.data.totalElements ?? content.length
        const totalPages = res.data.data.totalPages ?? Math.max(1, Math.ceil(totalElements / size))
        return { content, totalElements, totalPages }
      }
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat artikel')
      }
    }

    return { content: [], totalElements: 0, totalPages: 1 }
  }

  async getByIdOrSlug(idOrSlug: string): Promise<ArticleItem> {
    const res = await apiClient.get<ApiResponse<any>>(`/api/v1/articles/${idOrSlug}`)
    if (res.data?.data) {
      return this.normalizeArticle(res.data.data)
    }
    throw new Error('Artikel tidak ditemukan')
  }

  async create(payload: CreateArticlePayload): Promise<ArticleItem> {
    const requestDTO = {
      title: payload.title.trim(),
      category: payload.category,
      excerpt: payload.excerpt?.trim(),
      content: payload.content.trim(),
      readingTime: payload.readingTime?.trim(),
      isPublished: Boolean(payload.isPublished)
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )
    if (payload.file) {
      formData.append('file', payload.file)
    }

    const res = await apiClient.post<ApiResponse<any>>('/api/v1/articles', formData)
    if (res.data?.data) {
      return this.normalizeArticle(res.data.data)
    }
    throw new Error('Gagal menambahkan artikel')
  }

  async update(id: string, payload: UpdateArticlePayload): Promise<ArticleItem> {
    const requestDTO = {
      title: payload.title?.trim(),
      category: payload.category,
      excerpt: payload.excerpt?.trim(),
      content: payload.content?.trim(),
      readingTime: payload.readingTime?.trim(),
      isPublished: payload.isPublished,
      removeThumbnail: Boolean(payload.removeThumbnail)
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )
    if (payload.file) {
      formData.append('file', payload.file)
    }

    const res = await apiClient.put<ApiResponse<any>>(`/api/v1/articles/${id}`, formData)
    if (res.data?.data) {
      return this.normalizeArticle(res.data.data)
    }
    throw new Error('Gagal memperbarui artikel')
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/articles/${id}`)
  }

  async togglePublish(id: string): Promise<ArticleItem> {
    const res = await apiClient.patch<ApiResponse<any>>(`/api/v1/articles/${id}/publish`)
    if (res.data?.data) {
      return this.normalizeArticle(res.data.data)
    }
    throw new Error('Gagal mengubah status publikasi artikel')
  }

  async uploadContentImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post<ApiResponse<{ url: string }>>('/api/v1/articles/upload-image', formData)
    if (res.data?.data?.url) {
      return res.data.data.url
    }
    throw new Error('Gagal mengunggah gambar konten artikel')
  }
}
