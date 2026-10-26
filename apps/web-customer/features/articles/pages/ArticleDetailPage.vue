<template>
  <div class="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-white min-h-[85vh]">
    <div class="max-w-4xl mx-auto px-5 sm:px-8">
      <!-- Back Button -->
      <NuxtLink 
        to="/articles" 
        class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 mb-8 transition"
      >
        <span>←</span>
        <span>Kembali ke Daftar Artikel</span>
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="isLoading" class="animate-pulse space-y-4">
        <div class="h-8 bg-brand-50 rounded-xl w-3/4"></div>
        <div class="h-64 bg-brand-50 rounded-3xl w-full"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="p-6 rounded-3xl bg-rose-50 text-rose-800 text-center">
        <p class="font-bold text-lg">{{ errorMessage }}</p>
        <NuxtLink to="/articles" class="inline-block mt-4 text-sm font-bold text-brand-600">
          Lihat Artikel Lainnya
        </NuxtLink>
      </div>

      <!-- Detail Content -->
      <article v-else-if="currentArticle" class="space-y-8">
        <div>
          <span class="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
            {{ currentArticle.category }}
          </span>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink mt-4 leading-tight">
            {{ currentArticle.title }}
          </h1>
          <div class="flex items-center gap-4 text-xs sm:text-sm text-ink-soft mt-4">
            <span class="font-semibold text-ink">{{ currentArticle.author }}</span>
            <span>•</span>
            <span>{{ currentArticle.publishedAt }}</span>
            <span>•</span>
            <span>{{ currentArticle.readingTime }}</span>
          </div>
        </div>

        <!-- Hero Image -->
        <div class="aspect-[16/9] rounded-3xl overflow-hidden shadow-card">
          <img 
            :src="currentArticle.thumbnailUrl" 
            :alt="currentArticle.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Article Prose Body -->
        <div 
          class="medium-rendered-content max-w-none text-ink-soft leading-relaxed"
          v-html="currentArticle.content"
        ></div>

        <!-- Article Footer CTA -->
        <div class="mt-12 p-8 rounded-3xl bg-brand-50 border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 class="text-xl font-bold text-ink">Punya pakaian berbahan serupa?</h3>
            <p class="text-sm text-ink-soft mt-1">Serahkan pencuciannya ke Nuy Laundry, 100% garansi bersih dan terawat.</p>
          </div>
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20tertarik%20dengan%20layanan%20kalian" 
            target="_blank" 
            rel="noopener"
            class="shrink-0 px-6 py-3.5 rounded-full bg-brand-600 text-white font-semibold shadow-soft hover:bg-brand-700 transition"
          >
            Pesan Sekarang
          </a>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticlesProvider } from '../providers/useArticlesProvider'

const route = useRoute()
const slug = route.params.slug as string

const {
  currentArticle,
  isLoading,
  errorMessage,
  fetchArticleDetail
} = useArticlesProvider()

onMounted(() => {
  if (slug) {
    fetchArticleDetail(slug)
  }
})
</script>
