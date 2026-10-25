import { ref } from 'vue'
import { ArticleRepository } from '../repositories/ArticleRepository'
import type { ArticleCategory, ArticleItem, ArticleDetail } from '../models/ArticleModel'

export const useArticlesProvider = () => {
  const repository = new ArticleRepository()

  const categories: ArticleCategory[] = [
    'Semua',
    'Tips Perawatan',
    'Panduan Bahan',
    'Info & Promo'
  ]

  const activeCategory = ref<ArticleCategory>('Semua')
  const articles = ref<ArticleItem[]>([])
  const currentArticle = ref<ArticleDetail | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const fetchArticles = async (category: ArticleCategory = 'Semua') => {
    isLoading.value = true
    errorMessage.value = null
    activeCategory.value = category

    try {
      articles.value = await repository.getAll(category)
    } catch (err: any) {
      errorMessage.value = err?.message || 'Gagal memuat artikel.'
    } finally {
      isLoading.value = false
    }
  }

  const fetchArticleDetail = async (slug: string) => {
    isLoading.value = true
    errorMessage.value = null
    currentArticle.value = null

    try {
      const data = await repository.getBySlug(slug)
      if (!data) {
        throw new Error('Artikel tidak ditemukan.')
      }
      currentArticle.value = data
    } catch (err: any) {
      errorMessage.value = err?.message || 'Artikel tidak ditemukan.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    activeCategory,
    articles,
    currentArticle,
    isLoading,
    errorMessage,
    fetchArticles,
    fetchArticleDetail
  }
}
