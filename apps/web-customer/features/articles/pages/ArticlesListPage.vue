<template>
  <div class="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-b from-brand-50/50 via-white to-white min-h-[85vh]">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold tracking-wider uppercase">
          Edukasi & Tips Laundry
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink mt-3 tracking-tight">
          Wawasan Merawat Pakaian
        </h1>
        <p class="text-ink-soft text-base mt-3 leading-relaxed">
          Ketahui panduan perawatan kain, teknik mencuci yang benar, dan tips agar baju favoritmu selalu bersih, awet, dan wangi seperti baru.
        </p>
      </div>

      <!-- Search & Filters Container -->
      <div class="max-w-2xl mx-auto mb-12 space-y-5">
        <!-- Search Input -->
        <div class="relative">
          <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari topik artikel, tips noda, bahan katun..."
            class="w-full pl-12 pr-10 py-3 rounded-full bg-white border border-brand-100 shadow-card text-sm focus:outline-none focus:border-brand-600 transition"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover:text-ink font-bold"
          >
            ✕
          </button>
        </div>

        <!-- Categories Pills Filter -->
        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="fetchArticles(cat)"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-semibold transition',
              activeCategory === cat
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-white text-ink-soft hover:text-ink shadow-card border border-brand-50'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="rounded-3xl bg-white p-6 shadow-card border border-brand-50 animate-pulse">
          <div class="aspect-[16/10] bg-brand-50 rounded-2xl mb-4"></div>
          <div class="h-4 bg-brand-50 rounded w-1/3 mb-3"></div>
          <div class="h-6 bg-brand-50 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-brand-50 rounded w-full"></div>
        </div>
      </div>

      <!-- Article Grid -->
      <div v-else-if="displayArticles.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ArticleCard 
          v-for="art in displayArticles" 
          :key="art.id" 
          :article="art" 
        />
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <p class="text-ink-soft text-base">Belum ada artikel yang cocok dengan pencarian.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useArticlesProvider } from '../providers/useArticlesProvider'
import ArticleCard from '../components/ArticleCard.vue'

const searchQuery = ref('')

const {
  categories,
  activeCategory,
  articles,
  isLoading,
  fetchArticles
} = useArticlesProvider()

const displayArticles = computed(() => {
  if (!searchQuery.value.trim()) return articles.value
  const q = searchQuery.value.toLowerCase()
  return articles.value.filter(a => 
    a.title.toLowerCase().includes(q) || 
    a.excerpt.toLowerCase().includes(q)
  )
})

onMounted(() => {
  fetchArticles()
})
</script>
