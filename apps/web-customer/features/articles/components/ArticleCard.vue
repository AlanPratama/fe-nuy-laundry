<template>
  <article class="group rounded-3xl bg-white border border-brand-50 shadow-card overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-soft transition duration-300">
    <!-- Thumbnail Image -->
    <div class="relative aspect-[16/10] overflow-hidden bg-brand-50">
      <img 
        :src="article.thumbnailUrl" 
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        loading="lazy"
      />
      <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-brand-600 text-xs font-bold shadow-sm">
        {{ article.category }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-6 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 text-xs text-ink-soft mb-3">
          <span>{{ article.publishedAt }}</span>
          <span>•</span>
          <span>{{ article.readingTime }}</span>
        </div>

        <h3 class="text-lg font-bold text-ink leading-snug group-hover:text-brand-600 transition">
          <NuxtLink :to="`/articles/${article.slug}`">
            {{ article.title }}
          </NuxtLink>
        </h3>

        <p class="mt-3 text-ink-soft text-sm leading-relaxed line-clamp-2">
          {{ article.excerpt }}
        </p>
      </div>

      <div class="mt-6 pt-4 border-t border-brand-50 flex items-center justify-between">
        <span class="text-xs text-ink font-medium">{{ article.author }}</span>
        <NuxtLink 
          :to="`/articles/${article.slug}`"
          class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <span>Baca Selengkapnya</span>
          <span>→</span>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ArticleItem } from '../models/ArticleModel'

defineProps<{
  article: ArticleItem
}>()
</script>
