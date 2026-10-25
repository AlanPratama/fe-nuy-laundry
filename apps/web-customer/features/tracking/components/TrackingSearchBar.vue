<template>
  <div class="w-full max-w-2xl mx-auto">
    <form @submit.prevent="handleSubmit" class="relative flex items-center">
      <div class="relative w-full">
        <input 
          v-model="modelValue"
          type="text" 
          placeholder="Masukkan nomor invoice (contoh: INV-20261025-001)..."
          class="w-full pl-6 pr-36 py-4 rounded-full bg-white border-2 border-brand-100 text-ink placeholder:text-ink-soft/60 focus:border-brand-600 focus:outline-none shadow-card text-sm sm:text-base transition"
        />
        <button 
          type="submit" 
          :disabled="isLoading"
          class="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-brand-600 text-white font-semibold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
        >
          <span v-if="isLoading" class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          <span>{{ isLoading ? 'Mencari...' : 'Lacak' }}</span>
        </button>
      </div>
    </form>
    
    <!-- Quick sample pill buttons -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-soft">
      <span>Contoh nomor demo:</span>
      <button 
        type="button" 
        @click="$emit('select-sample', 'INV-PERF-009369')"
        class="px-2.5 py-1 rounded-full bg-brand-600 text-white hover:bg-brand-700 font-bold shadow-xs transition"
      >
        INV-PERF-009369 (Live DB)
      </button>
      <button 
        type="button" 
        @click="$emit('select-sample', 'INV-20261025-001')"
        class="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 font-medium transition"
      >
        INV-20261025-001 (Proses)
      </button>
      <button 
        type="button" 
        @click="$emit('select-sample', 'INV-20261025-002')"
        class="px-2.5 py-1 rounded-full bg-mint/15 text-emerald-700 hover:bg-mint/25 font-medium transition"
      >
        INV-20261025-002 (Selesai)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'select-sample', sample: string): void
}>()

const modelValue = defineModel<string>({ default: '' })

const handleSubmit = () => {
  if (modelValue.value) {
    emit('search', modelValue.value)
  }
}
</script>
