<template>
  <section id="harga" class="py-20 lg:py-28 bg-ink relative overflow-hidden">
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/40 blob blur-3xl pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-5 sm:px-8">
      <div class="max-w-2xl mx-auto text-center">
        <p class="text-sun font-semibold tracking-wide uppercase text-sm">Daftar Harga</p>
        <h2 class="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight text-white">Harga jujur, tanpa biaya tersembunyi</h2>
        <p class="mt-4 text-white/60">Pilih paket kiloan reguler atau berlangganan bulanan untuk hemat lebih banyak.</p>
      </div>

      <!-- toggle tabs -->
      <div class="mt-10 flex justify-center">
        <div class="inline-flex p-1.5 rounded-full bg-white/10 backdrop-blur">
          <button 
            @click="activeTab = 'kiloan'"
            :class="['px-6 py-2.5 rounded-full text-sm font-semibold transition', activeTab === 'kiloan' ? 'tab-btn active' : 'text-white/80 hover:text-white']"
          >
            Kiloan
          </button>
          <button 
            @click="activeTab = 'bulanan'"
            :class="['px-6 py-2.5 rounded-full text-sm font-semibold transition', activeTab === 'bulanan' ? 'tab-btn active' : 'text-white/80 hover:text-white']"
          >
            Langganan Bulanan
          </button>
        </div>
      </div>

      <!-- pricing cards -->
      <div class="mt-12 grid md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
        <!-- basic / hemat -->
        <div class="rounded-3xl bg-white/5 border border-white/10 p-8 text-white flex flex-col hover:border-white/20 transition">
          <h3 class="text-lg font-semibold">Hemat</h3>
          <p class="text-white/50 text-sm mt-1">Cuci kering lipat</p>
          <p class="mt-6">
            <span class="text-4xl font-extrabold">{{ activeTab === 'kiloan' ? 'Rp6.000' : 'Rp199rb' }}</span>
            <span class="text-white/50 text-sm ml-1">{{ activeTab === 'kiloan' ? '/kg' : '/bulan' }}</span>
          </p>
          <p class="text-xs text-sun mt-2 h-4 font-medium">{{ activeTab === 'bulanan' ? 'Kuota 40 kg / bulan' : 'Minimal order 3 kg' }}</p>
          <ul class="mt-7 space-y-3 text-[15px] text-white/80 flex-1">
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Selesai 2 hari</li>
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Deterjen premium ramah kulit</li>
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Dilipat rapi & siap lemari</li>
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> 1 mesin 1 pelanggan</li>
          </ul>
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20pesan%20Paket%20Hemat" 
            target="_blank" 
            rel="noopener" 
            class="mt-8 block text-center py-3.5 rounded-full border border-white/20 font-semibold hover:bg-white hover:text-ink transition"
          >
            Pilih Paket
          </a>
        </div>

        <!-- popular / rapi (highlighted) -->
        <div class="relative rounded-3xl bg-white p-8 text-ink flex flex-col md:-my-4 shadow-soft">
          <span class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-sun text-xs font-bold whitespace-nowrap shadow-sm">
            Paling Laris
          </span>
          <h3 class="text-lg font-semibold">Rapi</h3>
          <p class="text-ink-soft text-sm mt-1">Cuci + setrika uap</p>
          <p class="mt-6">
            <span class="text-4xl font-extrabold text-brand-600">{{ activeTab === 'kiloan' ? 'Rp8.000' : 'Rp279rb' }}</span>
            <span class="text-ink-soft text-sm ml-1">{{ activeTab === 'kiloan' ? '/kg' : '/bulan' }}</span>
          </p>
          <p class="text-xs text-brand-600 font-medium mt-2 h-4">{{ activeTab === 'bulanan' ? 'Kuota 40 kg / bulan' : 'Gratis antar jemput < 5km' }}</p>
          <ul class="mt-7 space-y-3 text-[15px] text-ink-soft flex-1">
            <li class="flex gap-3"><span class="text-brand-600 font-bold">—</span> Selesai 24 jam</li>
            <li class="flex gap-3"><span class="text-brand-600 font-bold">—</span> Setrika uap licin & pewangi tahan 7 hari</li>
            <li class="flex gap-3"><span class="text-brand-600 font-bold">—</span> Gratis antar jemput</li>
            <li class="flex gap-3"><span class="text-brand-600 font-bold">—</span> Kemasan plastik eksklusif berpengharum</li>
          </ul>
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20pesan%20Paket%20Rapi" 
            target="_blank" 
            rel="noopener" 
            class="mt-8 block text-center py-3.5 rounded-full bg-brand-600 text-white font-semibold shadow-soft hover:bg-brand-700 transition"
          >
            Pilih Paket
          </a>
        </div>

        <!-- express / kilat -->
        <div class="rounded-3xl bg-white/5 border border-white/10 p-8 text-white flex flex-col hover:border-white/20 transition">
          <h3 class="text-lg font-semibold">Kilat</h3>
          <p class="text-white/50 text-sm mt-1">Express, selesai hari ini</p>
          <p class="mt-6">
            <span class="text-4xl font-extrabold">{{ activeTab === 'kiloan' ? 'Rp12.000' : 'Rp399rb' }}</span>
            <span class="text-white/50 text-sm ml-1">{{ activeTab === 'kiloan' ? '/kg' : '/bulan' }}</span>
          </p>
          <p class="text-xs text-sun mt-2 h-4 font-medium">{{ activeTab === 'bulanan' ? 'Kuota 35 kg express / bulan' : 'Selesai 6 jam' }}</p>
          <ul class="mt-7 space-y-3 text-[15px] text-white/80 flex-1">
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Selesai hanya 6 jam</li>
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Cuci + setrika uap</li>
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Prioritas antrean nomor satu</li>
            <li class="flex gap-3"><span class="text-sun font-bold">—</span> Gratis antar jemput</li>
          </ul>
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20pesan%20Paket%20Kilat" 
            target="_blank" 
            rel="noopener" 
            class="mt-8 block text-center py-3.5 rounded-full border border-white/20 font-semibold hover:bg-white hover:text-ink transition"
          >
            Pilih Paket
          </a>
        </div>
      </div>

      <!-- harga satuan -->
      <div class="mt-16 max-w-5xl mx-auto rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-bold text-lg">Harga Satuan Non-Kiloan</h3>
          <span class="text-xs text-sun bg-white/10 px-3 py-1 rounded-full font-medium">Bahan Sensitif & Item Besar</span>
        </div>
        <div class="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Bed cover</span><span class="text-white font-semibold">Rp25.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Selimut</span><span class="text-white font-semibold">Rp20.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Jas / Blazer</span><span class="text-white font-semibold">Rp30.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Kebaya</span><span class="text-white font-semibold">Rp40.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Sepatu</span><span class="text-white font-semibold">Rp35.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Tas</span><span class="text-white font-semibold">Rp45.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Gorden /m</span><span class="text-white font-semibold">Rp15.000</span></div>
          <div class="flex justify-between border-b border-white/10 pb-3 text-white/70"><span>Boneka</span><span class="text-white font-semibold">Rp20.000</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'kiloan' | 'bulanan'>('kiloan')
</script>
