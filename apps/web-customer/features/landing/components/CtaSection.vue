<template>
  <section id="kontak" class="py-20 lg:py-28">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="relative overflow-hidden rounded-[2.5rem] bg-brand-600 px-6 py-14 sm:px-14 sm:py-16 lg:py-20 shadow-soft">
        <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full border-[40px] border-white/10 pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-sun/20 blob pointer-events-none"></div>
        <div class="float-slow absolute top-10 left-[45%] w-4 h-4 rounded-full bg-sun hidden md:block"></div>
        <div class="float-mid absolute bottom-14 right-[30%] w-3 h-3 rounded-full bg-white/60 hidden md:block"></div>

        <div class="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div class="text-center lg:text-left">
            <span class="inline-block px-3.5 py-1 rounded-full bg-white/20 text-sun font-semibold text-xs tracking-wider uppercase mb-4">
              Promo Spesial Pelanggan Baru
            </span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Diskon 20% untuk<br class="hidden sm:block" /> pesanan pertamamu
            </h2>
            <p class="mt-4 text-white/80 max-w-lg mx-auto lg:mx-0">
              Gunakan kode <span class="font-bold text-sun">NUYBARU</span> saat memesan via WhatsApp. Berlaku untuk semua paket kiloan & satuan!
            </p>
          </div>

          <div class="flex flex-col sm:flex-row lg:flex-col gap-4 justify-center">
            <a 
              href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20pesan%20dengan%20kode%20diskon%20NUYBARU" 
              target="_blank" 
              rel="noopener" 
              class="text-center px-8 py-4 rounded-full bg-sun text-ink font-bold hover:-translate-y-0.5 hover:shadow-xl transition"
            >
              Klaim Diskon via WhatsApp
            </a>
            <a 
              href="tel:+6281234567890" 
              class="text-center px-8 py-4 rounded-full bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition"
            >
              Telepon: 0812-3456-7890
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
