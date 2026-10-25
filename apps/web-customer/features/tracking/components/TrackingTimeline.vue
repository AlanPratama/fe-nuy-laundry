<template>
  <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-50 shadow-card">
    <div class="flex items-center justify-between pb-5 border-b border-brand-50 mb-6">
      <div class="flex items-center gap-2.5">
        <span class="w-3 h-3 rounded-full bg-brand-600 animate-pulse"></span>
        <h3 class="text-lg font-bold text-ink">Timeline Tahapan Cucian</h3>
      </div>
      <span class="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100/60">
        Live Tracker
      </span>
    </div>

    <!-- Timeline Steps List with Flex Rail -->
    <div class="space-y-0">
      <div 
        v-for="(step, idx) in steps" 
        :key="step.id" 
        class="flex items-start gap-4 sm:gap-5 group"
      >
        <div class="flex flex-col items-center self-stretch shrink-0">
          <div 
            :class="[
              'w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-xs font-bold transition-all duration-200 z-10 shrink-0 relative',
              step.isCurrent
                ? 'bg-brand-600 text-white shadow-soft ring-4 ring-brand-100'
                : step.isCompleted
                ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700'
                : 'bg-white border-2 border-brand-200 text-ink-soft/40'
            ]"
          >
            <span 
              v-if="step.isCurrent" 
              class="absolute -inset-1.5 rounded-full bg-brand-500/25 animate-ping pointer-events-none"
            ></span>
            <span 
              v-if="step.isCurrent" 
              class="absolute -inset-1 rounded-full bg-brand-400/20 animate-pulse pointer-events-none"
            ></span>

            <svg v-if="step.isCompleted && !step.isCurrent" class="w-4 h-4 text-emerald-600 relative z-10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else class="relative z-10 font-bold">{{ idx + 1 }}</span>
          </div>

          <div 
            v-if="idx < steps.length - 1"
            :class="[
              'w-0.5 flex-1 my-1.5 transition-colors',
              step.isCompleted ? 'bg-emerald-200' : 'bg-brand-100'
            ]"
          ></div>
        </div>

        <!-- Content Card Column -->
        <div 
          :class="[
            'flex-1 mb-5 p-4 sm:p-5 rounded-2xl border transition-all duration-200',
            step.isCurrent 
              ? 'bg-brand-50/40 border-brand-300 shadow-sm' 
              : step.isCompleted
              ? 'bg-white border-brand-50 hover:border-brand-100 shadow-xs'
              : 'bg-gray-50/40 border-gray-100 opacity-60'
          ]"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <h4 :class="['font-bold text-sm sm:text-base tracking-tight', step.isCurrent ? 'text-brand-600' : 'text-ink']">
                {{ step.title }}
              </h4>

              <!-- Status Badge (Clean without internal pulsing dot) -->
              <span 
                v-if="step.isCurrent"
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-600 text-white shadow-xs inline-flex items-center"
              >
                <span>Sedang Berjalan</span>
              </span>
              <span 
                v-else-if="step.isCompleted"
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
              >
                Selesai
              </span>
              <span 
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500"
              >
                Menunggu
              </span>
            </div>

            <!-- Timestamp pill -->
            <span v-if="step.time" class="text-xs font-mono text-ink-soft bg-brand-50/80 px-2.5 py-1 rounded-full border border-brand-100/60 w-max shrink-0">
              {{ step.time }}
            </span>
          </div>

          <p class="text-xs sm:text-sm text-ink-soft mt-2 leading-relaxed">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrackingStep } from '../models/TrackingModel'

defineProps<{
  steps: TrackingStep[]
}>()
</script>
