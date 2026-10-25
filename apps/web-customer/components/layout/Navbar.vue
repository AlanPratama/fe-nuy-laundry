<template>
  <header id="navbar" :class="['fixed inset-x-0 top-0 z-50 transition-all duration-300', isScrolled ? 'scrolled' : '']">
    <nav class="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <span class="w-10 h-10 rounded-2xl bg-brand-600 grid place-items-center shadow-soft">
          <span class="w-5 h-5 rounded-full border-[3px] border-white relative">
            <span class="absolute inset-1 rounded-full bg-sun"></span>
          </span>
        </span>
        <span class="text-xl font-extrabold tracking-tight">Nuy<span class="text-brand-600">Laundry</span></span>
      </NuxtLink>

      <ul class="hidden lg:flex items-center gap-8 text-[15px] font-medium text-ink-soft">
        <li><NuxtLink to="/#layanan" class="hover:text-brand-600 transition">Layanan</NuxtLink></li>
        <li><NuxtLink to="/#cara-kerja" class="hover:text-brand-600 transition">Cara Kerja</NuxtLink></li>
        <li><NuxtLink to="/#harga" class="hover:text-brand-600 transition">Harga</NuxtLink></li>
        <li><NuxtLink to="/#testimoni" class="hover:text-brand-600 transition">Testimoni</NuxtLink></li>
        <li><NuxtLink to="/#faq" class="hover:text-brand-600 transition">FAQ</NuxtLink></li>
        <li>
          <NuxtLink 
            to="/tracking" 
            class="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100 transition inline-flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            Cek Resi
          </NuxtLink>
        </li>
        <li><NuxtLink to="/articles" class="hover:text-brand-600 transition">Artikel</NuxtLink></li>
      </ul>

      <div class="hidden lg:flex items-center gap-3">
        <NuxtLink to="/#kontak" class="px-5 py-3 rounded-full font-semibold text-ink hover:text-brand-600 transition">Kontak</NuxtLink>
        <a 
          href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20order%20laundry%20antar%20jemput" 
          target="_blank" 
          rel="noopener" 
          class="px-6 py-3 rounded-full bg-brand-600 text-white font-semibold shadow-soft hover:bg-brand-700 hover:-translate-y-0.5 transition"
        >
          Pesan Sekarang
        </a>
      </div>

      <!-- Mobile Hamburger Button -->
      <button 
        @click="toggleMenu" 
        aria-label="Buka menu" 
        class="lg:hidden w-11 h-11 rounded-xl bg-brand-50 grid place-items-center"
      >
        <span class="block w-5 space-y-1.5">
          <span :class="['bar block h-0.5 bg-ink rounded transition duration-300', menuOpen ? 'translate-y-2 rotate-45' : '']"></span>
          <span :class="['bar block h-0.5 bg-ink rounded transition duration-300', menuOpen ? 'opacity-0' : '']"></span>
          <span :class="['bar block h-0.5 bg-ink rounded transition duration-300', menuOpen ? '-translate-y-2 -rotate-45' : '']"></span>
        </span>
      </button>
    </nav>

    <!-- Mobile Menu dropdown -->
    <div 
      :class="['lg:hidden overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur border-t border-brand-50', menuOpen ? 'max-h-96' : 'max-h-0']"
    >
      <ul class="px-5 sm:px-8 py-5 space-y-2 font-medium">
        <li><NuxtLink @click="menuOpen = false" to="/#layanan" class="block py-2 px-4 rounded-xl hover:bg-brand-50">Layanan</NuxtLink></li>
        <li><NuxtLink @click="menuOpen = false" to="/#cara-kerja" class="block py-2 px-4 rounded-xl hover:bg-brand-50">Cara Kerja</NuxtLink></li>
        <li><NuxtLink @click="menuOpen = false" to="/#harga" class="block py-2 px-4 rounded-xl hover:bg-brand-50">Harga</NuxtLink></li>
        <li><NuxtLink @click="menuOpen = false" to="/tracking" class="block py-2 px-4 rounded-xl bg-brand-50 text-brand-600 font-semibold">Cek Resi / Tracking</NuxtLink></li>
        <li><NuxtLink @click="menuOpen = false" to="/articles" class="block py-2 px-4 rounded-xl hover:bg-brand-50">Artikel</NuxtLink></li>
        <li class="pt-2">
          <a 
            href="https://wa.me/6281234567890" 
            target="_blank" 
            rel="noopener" 
            class="block text-center py-3 rounded-full bg-brand-600 text-white font-semibold shadow-soft"
          >
            Pesan Sekarang
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleScroll = () => {
  if (typeof window !== 'undefined') {
    isScrolled.value = window.scrollY > 20
  }
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
