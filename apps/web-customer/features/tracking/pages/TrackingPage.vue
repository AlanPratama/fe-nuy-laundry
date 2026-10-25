<template>
  <div class="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-b from-brand-50/50 via-white to-white min-h-[85vh]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold tracking-wider uppercase">
          Layanan Pelacakan Mandiri
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-ink mt-3 tracking-tight">
          Cek Status Cucianmu
        </h1>
        <p class="text-ink-soft text-sm sm:text-base mt-2">
          Masukkan nomor invoice atau resi yang tertera pada nota digital WhatsApp untuk melihat progres cucian real-time.
        </p>
      </div>

      <!-- Search bar -->
      <TrackingSearchBar 
        v-model="invoiceQuery"
        :is-loading="isLoading"
        @search="searchTracking"
        @select-sample="handleSelectSample"
      />

      <!-- Error message -->
      <div v-if="errorMessage" class="mt-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
        <span class="text-xl">⚠️</span>
        <div>
          <p class="font-bold">Pencarian Tidak Ditemukan</p>
          <p class="mt-1 text-rose-700 leading-relaxed">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Tracking Result Section -->
      <div v-if="result" class="mt-10 grid lg:grid-cols-[1.25fr_1.1fr] gap-8 items-start">
        <!-- Left: Order Details & Photos (Expanded width) -->
        <TrackingDetailCard :result="result" />

        <!-- Right: Progress Timeline -->
        <TrackingTimeline :steps="result.steps" />
      </div>

      <!-- Initial empty state guide when user hasn't searched -->
      <div v-else-if="!hasSearched" class="mt-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-brand-50 shadow-card">
        <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center text-3xl mx-auto mb-4">
          🧺
        </div>
        <h3 class="text-lg font-bold text-ink">Belum tahu nomor invoicemu?</h3>
        <p class="text-xs sm:text-sm text-ink-soft mt-2 leading-relaxed">
          Nomor invoice tercantum di pesan konfirmasi penjemputan WhatsApp kamu atau pada struk fisik saat kurir menimbang pakaian.
        </p>
        <a 
          href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20lupa%20nomor%20invoice%20saya"
          target="_blank"
          rel="noopener"
          class="inline-block mt-5 px-6 py-2.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition"
        >
          Hubungi CS via WhatsApp
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTrackingProvider } from '../providers/useTrackingProvider'
import TrackingSearchBar from '../components/TrackingSearchBar.vue'
import TrackingTimeline from '../components/TrackingTimeline.vue'
import TrackingDetailCard from '../components/TrackingDetailCard.vue'

const {
  invoiceQuery,
  result,
  isLoading,
  errorMessage,
  hasSearched,
  searchTracking
} = useTrackingProvider()

const route = useRoute()

const handleSelectSample = (sample: string) => {
  invoiceQuery.value = sample
  searchTracking(sample)
}

onMounted(() => {
  // If invoice passed in query param: /tracking?invoice=INV-20261025-001
  const q = route.query.invoice as string
  if (q) {
    invoiceQuery.value = q
    searchTracking(q)
  }
})
</script>
