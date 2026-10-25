<template>
  <footer class="bg-ink text-white/70 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] gap-10">
        <div>
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <span class="w-10 h-10 rounded-2xl bg-brand-600 grid place-items-center">
              <span class="w-5 h-5 rounded-full border-[3px] border-white relative">
                <span class="absolute inset-1 rounded-full bg-sun"></span>
              </span>
            </span>
            <span class="text-xl font-extrabold text-white">Nuy<span class="text-brand-300">Laundry</span></span>
          </NuxtLink>
          <p class="mt-5 text-sm leading-relaxed max-w-xs">
            Laundry kiloan & satuan dengan antar jemput gratis. Bersih, wangi, rapi — setiap hari.
          </p>
          <div class="mt-6 flex items-center gap-3">
            <span class="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sun">1 Mesin 1 Pelanggan</span>
            <span class="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-mint">100% Garansi</span>
          </div>
        </div>

        <div>
          <h4 class="text-white font-semibold">Layanan</h4>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li><NuxtLink to="/#layanan" class="hover:text-white transition">Cuci Kering Lipat</NuxtLink></li>
            <li><NuxtLink to="/#layanan" class="hover:text-white transition">Cuci Setrika Uap</NuxtLink></li>
            <li><NuxtLink to="/#layanan" class="hover:text-white transition">Express 6 Jam</NuxtLink></li>
            <li><NuxtLink to="/#layanan" class="hover:text-white transition">Dry Clean Jas & Kebaya</NuxtLink></li>
            <li><NuxtLink to="/#layanan" class="hover:text-white transition">Cuci Sepatu & Tas</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold">Navigasi</h4>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li><NuxtLink to="/tracking" class="text-sun font-medium hover:text-white transition flex items-center gap-1.5">
              <span>●</span> Cek Resi / Tracking
            </NuxtLink></li>
            <li><NuxtLink to="/articles" class="hover:text-white transition">Artikel & Tips Perawatan</NuxtLink></li>
            <li><NuxtLink to="/#cara-kerja" class="hover:text-white transition">Cara Kerja</NuxtLink></li>
            <li><NuxtLink to="/#harga" class="hover:text-white transition">Daftar Harga</NuxtLink></li>
            <li><NuxtLink to="/#faq" class="hover:text-white transition">Tanya Jawab (FAQ)</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold">Outlet & Jam Operasional</h4>
          <p class="mt-4 text-sm leading-relaxed">
            Jl. Melati Raya No. 12,<br />
            Jakarta Selatan 12345
          </p>
          <p class="mt-3 text-sm">Buka Setiap Hari, 07.00 – 21.00 WIB</p>
          <p class="mt-3 text-sm text-white font-medium">WhatsApp: 0812-3456-7890</p>
        </div>
      </div>

      <div class="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between text-xs">
        <p>© {{ currentYear }} Nuy Laundry. Semua hak dilindungi.</p>
        <p>Dibuat dengan sepenuh hati & dedikasi untuk cucian bersihmu.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
