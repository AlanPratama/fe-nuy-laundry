import { create } from 'zustand'
import type { 
  ArticleItem, 
  CreateArticlePayload, 
  UpdateArticlePayload,
  ArticleMetrics
} from '../models/ArticleModel'
import { ArticleRepository } from '../repositories/ArticleRepository'

interface ArticleStore {
  articles: ArticleItem[]
  isLoading: boolean
  error: string | null
  
  // Filters & Pagination
  searchQuery: string
  categoryFilter: string
  statusFilter: 'ALL' | 'PUBLISHED' | 'DRAFT'
  sortBy: 'createdAt' | 'title' | 'publishedAt'
  direction: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  viewMode: 'table' | 'card'
  // Metrics
  metrics: ArticleMetrics | null
  fetchMetrics: () => Promise<void>

  // Actions
  fetchArticles: () => Promise<void>
  createArticle: (payload: CreateArticlePayload) => Promise<ArticleItem>
  updateArticle: (id: string, payload: UpdateArticlePayload) => Promise<ArticleItem>
  deleteArticle: (id: string) => Promise<void>
  togglePublish: (id: string) => Promise<ArticleItem>
  uploadContentImage: (file: File) => Promise<string>

  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: string) => void
  setStatusFilter: (status: 'ALL' | 'PUBLISHED' | 'DRAFT') => void
  setSorting: (sortBy: 'createdAt' | 'title' | 'publishedAt', direction: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setViewMode: (mode: 'table' | 'card') => void
  resetFilters: () => void
}

const articleRepo = new ArticleRepository()

export const useArticleStore = create<ArticleStore>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  categoryFilter: 'ALL',
  statusFilter: 'ALL',
  sortBy: 'createdAt',
  direction: 'desc',
  currentPage: 1,
  pageSize: 9,
  totalElements: 0,
  totalPages: 1,
  viewMode: 'card',
  metrics: null,

  fetchMetrics: async () => {
    try {
      const metrics = await articleRepo.getMetrics()
      set({ metrics })
    } catch (err) {
      console.error('Failed to load article metrics in store:', err)
    }
  },

  fetchArticles: async () => {
    const { searchQuery, categoryFilter, statusFilter, sortBy, direction, currentPage, pageSize } = get()
    set({ isLoading: true, error: null })

    try {
      let isPublished: boolean | undefined = undefined
      if (statusFilter === 'PUBLISHED') isPublished = true
      if (statusFilter === 'DRAFT') isPublished = false

      const res = await articleRepo.getAll({
        page: currentPage - 1,
        size: pageSize,
        search: searchQuery || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        isPublished,
        sortBy,
        direction
      })

      set({
        articles: res.content,
        totalElements: res.totalElements,
        totalPages: Math.max(1, res.totalPages),
        isLoading: false
      })
    } catch (err: any) {
      set({
        error: err.message || 'Gagal memuat artikel',
        isLoading: false
      })
    }
  },

  createArticle: async (payload: CreateArticlePayload) => {
    const newArticle = await articleRepo.create(payload)
    await get().fetchArticles()
    await get().fetchMetrics()
    return newArticle
  },

  updateArticle: async (id: string, payload: UpdateArticlePayload) => {
    const updated = await articleRepo.update(id, payload)
    await get().fetchArticles()
    await get().fetchMetrics()
    return updated
  },

  deleteArticle: async (id: string) => {
    await articleRepo.delete(id)
    await get().fetchArticles()
    await get().fetchMetrics()
  },

  togglePublish: async (id: string) => {
    const updated = await articleRepo.togglePublish(id)
    set((state) => ({
      articles: state.articles.map((item) => (item.id === id ? updated : item))
    }))
    await get().fetchMetrics()
    return updated
  },

  uploadContentImage: async (file: File) => {
    return await articleRepo.uploadContentImage(file)
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setCategoryFilter: (category: string) => {
    set({ categoryFilter: category, currentPage: 1 })
    get().fetchArticles()
  },

  setStatusFilter: (status: 'ALL' | 'PUBLISHED' | 'DRAFT') => {
    set({ statusFilter: status, currentPage: 1 })
    get().fetchArticles()
  },

  setSorting: (sortBy, direction) => {
    set({ sortBy, direction })
    get().fetchArticles()
  },

  setPage: (page: number) => {
    set({ currentPage: page })
    get().fetchArticles()
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 })
    get().fetchArticles()
  },

  setViewMode: (mode: 'table' | 'card') => {
    set({ viewMode: mode })
  },

  resetFilters: () => {
    set({
      searchQuery: '',
      categoryFilter: 'ALL',
      statusFilter: 'ALL',
      sortBy: 'createdAt',
      direction: 'desc',
      currentPage: 1
    })
    get().fetchArticles()
  }
}))
