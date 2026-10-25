<template>
  <section id="faq" class="py-20 lg:py-28 bg-brand-50/60">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_1.4fr] gap-12">
      <div>
        <p class="text-brand-600 font-semibold tracking-wide uppercase text-sm">FAQ</p>
        <h2 class="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">Pertanyaan yang sering ditanyakan</h2>
        <p class="mt-4 text-ink-soft">
          Belum menemukan jawaban yang kamu cari? Tim kami siap membantu setiap hari pukul 07.00 – 21.00 WIB.
        </p>
        <a 
          href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20tanya%20seputar%20layanan" 
          target="_blank" 
          rel="noopener" 
          class="inline-block mt-8 px-7 py-3.5 rounded-full bg-white shadow-card font-semibold text-ink hover:-translate-y-0.5 transition"
        >
          Tanya Admin via WhatsApp
        </a>
      </div>

      <div class="space-y-4">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          :class="['rounded-2xl bg-white shadow-card transition duration-200', activeFaq === index ? 'ring-2 ring-brand-600/10' : '']"
        >
          <button 
            @click="toggleFaq(index)" 
            class="w-full flex items-center justify-between gap-4 text-left p-6 font-semibold text-ink"
          >
            <span>{{ faq.q }}</span>
            <span 
              :class="['shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-600 grid place-items-center text-xl leading-none transition-transform duration-300', activeFaq === index ? 'rotate-45 bg-brand-600 text-white' : '']"
            >
              +
            </span>
          </button>
          <div 
            v-show="activeFaq === index" 
            class="px-6 pb-6 text-ink-soft text-[15px] leading-relaxed border-t border-brand-50 pt-4"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeFaq = ref<number | null>(0)

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    q: 'Berapa jangkauan area antar jemput gratis?',
    a: 'Gratis untuk radius 5 km dari outlet kami dengan minimal order 3 kg. Di luar radius 5 km, hanya dikenakan biaya tambahan hemat Rp2.000/km.'
  },
  {
    q: 'Bagaimana jika ada pakaian yang rusak atau hilang?',
    a: 'Setiap pakaian dicatat dan difoto saat penjemputan. Jika terjadi kerusakan atau kehilangan akibat kelalaian kami, kami berikan garansi ganti rugi hingga 10x biaya cuci item terkait.'
  },
  {
    q: 'Apakah pakaian saya dicampur dengan milik orang lain?',
    a: 'Sama sekali TIDAK. Kami menerapkan standar ketat 1 mesin 1 pelanggan. Cucianmu selalu terpisah, lebih higienis, dan tidak ada risiko tertukar.'
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Kami menerima tunai saat kurir antar cucian, transfer rekening bank, serta QRIS (GoPay, OVO, DANA, ShopeePay, BCA, dll).'
  },
  {
    q: 'Bisakah saya request pewangi aroma tertentu?',
    a: 'Tentu bisa! Tersedia 5 pilihan aroma: Fresh Ocean, Sakura Blossom, Sweet Vanilla, Lavender Breeze, dan Baby Soft. Atau kamu juga bisa request bebas pewangi untuk kulit sensitif/alergi.'
  }
]
</script>
