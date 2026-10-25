<template>
  <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-50 shadow-card">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-50 gap-4"
    >
      <div>
        <p class="text-xs uppercase tracking-wider text-ink-soft font-semibold">
          Nomor Invoice
        </p>
        <p class="text-xl font-extrabold text-ink mt-0.5">{{ result.invoiceNumber }}</p>
        <p class="text-xs text-ink-soft mt-1">
          Pelanggan:
          <span class="font-medium text-ink">{{ result.customerNameMasked }}</span>
        </p>
      </div>

      <!-- Status badge -->
      <div>
        <span
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm',
            result.status === 'DONE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : result.status === 'CANCELED'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200',
          ]"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              result.status === 'DONE'
                ? 'bg-emerald-500'
                : result.status === 'CANCELED'
                ? 'bg-rose-500'
                : 'bg-amber-500 animate-ping',
            ]"
          ></span>
          {{ result.statusLabel }}
        </span>
      </div>
    </div>

    <!-- Items detail table -->
    <div class="py-6 border-b border-brand-50">
      <h4 class="text-sm font-bold text-ink uppercase tracking-wider mb-4">
        Rincian Paket
      </h4>
      <div class="space-y-3">
        <div
          v-for="(item, idx) in result.items"
          :key="idx"
          class="flex items-center justify-between text-sm py-3 px-4 rounded-2xl bg-brand-50/40 border border-brand-50"
        >
          <div>
            <p class="font-semibold text-ink">{{ item.packageName }}</p>
            <p class="text-xs text-ink-soft mt-0.5">
              {{ item.quantity }} {{ item.packageType === "WEIGHT" ? "Kg" : "Pcs" }} ×
              Rp{{ item.pricePerUnit.toLocaleString("id-ID") }}
            </p>
          </div>
          <p class="font-bold text-ink">Rp{{ item.subtotal.toLocaleString("id-ID") }}</p>
        </div>
      </div>

      <div class="mt-4 pt-3 flex justify-between items-center text-base font-extrabold">
        <span class="text-ink">Total Tagihan</span>
        <span class="text-xl text-brand-600"
          >Rp{{ result.totalAmount.toLocaleString("id-ID") }}</span
        >
      </div>
    </div>

    <!-- Photo documentation before / after -->
    <div class="pt-6">
      <h4 class="text-sm font-bold text-ink uppercase tracking-wider mb-3">
        Dokumentasi Foto Cucian
      </h4>
      <p class="text-xs text-ink-soft mb-4">
        Transparansi kondisi pakaian sebelum dan sesudah dicuci oleh tim Nuy Laundry.
      </p>

      <div class="grid grid-cols-2 gap-4">
        <!-- Before -->
        <div>
          <p class="text-xs font-semibold text-ink-soft mb-2">Kondisi Awal (Diterima)</p>
          <div v-if="result.conditionBeforeUrls.length" class="space-y-2">
            <img
              v-for="(url, idx) in result.conditionBeforeUrls"
              :key="idx"
              :src="resolveImageUrl(url)"
              alt="Foto Sebelum Dicuci"
              class="w-full h-40 sm:h-44 object-cover rounded-2xl border border-brand-100 shadow-sm hover:scale-[1.02] transition"
            />
          </div>
          <div
            v-else
            class="h-40 sm:h-44 rounded-2xl bg-brand-50/50 border border-brand-100/50 grid place-items-center text-xs text-ink-soft"
          >
            Tidak ada foto
          </div>
        </div>

        <!-- After -->
        <div>
          <p class="text-xs font-semibold text-ink-soft mb-2">Kondisi Akhir (Selesai)</p>
          <div v-if="result.conditionAfterUrls.length" class="space-y-2">
            <img
              v-for="(url, idx) in result.conditionAfterUrls"
              :key="idx"
              :src="resolveImageUrl(url)"
              alt="Foto Sesudah Dicuci"
              class="w-full h-40 sm:h-44 object-cover rounded-2xl border border-brand-100 shadow-sm hover:scale-[1.02] transition"
            />
          </div>
          <div
            v-else
            class="h-40 sm:h-44 rounded-2xl bg-brand-50/40 border-2 border-dashed border-brand-200 grid place-items-center text-xs text-ink-soft text-center p-3"
          >
            <span>{{
              result.status === "DONE"
                ? "Foto belum diunggah"
                : "Akan tersedia setelah selesai"
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Need Help button -->
    <div class="mt-8 pt-6 border-t border-brand-50 text-center">
      <a
        :href="`https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20tanya%20pesanan%20invoice%20${result.invoiceNumber}`"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
      >
        <span>Butuh bantuan terkait pesanan ini? Chat WhatsApp Admin</span>
        <span>→</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrackingResult } from "../models/TrackingModel";
import { resolveImageUrl } from "../../../utils/imageUrl";

defineProps<{
  result: TrackingResult;
}>();
</script>
