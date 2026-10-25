import { ref } from 'vue'
import { TrackingRepository } from '../repositories/TrackingRepository'
import type { TrackingResult } from '../models/TrackingModel'

export const useTrackingProvider = () => {
  const config = useRuntimeConfig()
  const repository = new TrackingRepository(config.public.apiBase)

  const invoiceQuery = ref('')
  const result = ref<TrackingResult | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const hasSearched = ref(false)

  const searchTracking = async (query?: string) => {
    const q = query ?? invoiceQuery.value
    if (!q || !q.trim()) {
      errorMessage.value = 'Silakan masukkan nomor invoice atau kode resi kamu.'
      return
    }

    isLoading.value = true
    errorMessage.value = null
    hasSearched.value = true

    try {
      const data = await repository.trackByInvoice(q)
      result.value = data
      invoiceQuery.value = q
    } catch (err: any) {
      result.value = null
      errorMessage.value = err?.message || 'Gagal mengambil data pelacakan.'
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    invoiceQuery.value = ''
    result.value = null
    errorMessage.value = null
    hasSearched.value = false
  }

  return {
    invoiceQuery,
    result,
    isLoading,
    errorMessage,
    hasSearched,
    searchTracking,
    reset
  }
}
