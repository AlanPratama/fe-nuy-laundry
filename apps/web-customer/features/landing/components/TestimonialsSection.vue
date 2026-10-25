<template>
  <section id="testimoni" class="py-20 lg:py-28 overflow-hidden">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div class="max-w-xl">
          <p class="text-brand-600 font-semibold tracking-wide uppercase text-sm">Testimoni</p>
          <h2 class="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">Kata mereka yang sudah mencoba</h2>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-5xl font-extrabold text-ink">4.9</p>
          <div>
            <p class="text-sun text-lg tracking-widest">★★★★★</p>
            <p class="text-sm text-ink-soft">dari 1.200+ ulasan nyata</p>
          </div>
        </div>
      </div>
    </div>

    <!-- marquee carousel cards -->
    <div class="mt-12 marquee-wrap fade-x">
      <div class="marquee flex w-max gap-6 py-4" style="animation-duration: 50s">
        <!-- Card 1 -->
        <figure class="w-[320px] sm:w-[360px] shrink-0 p-7 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p class="text-sun tracking-widest">★★★★★</p>
          <blockquote class="mt-3 text-[15px] leading-relaxed text-ink/80">
            "Sebagai ibu dua anak, Nuy Laundry penyelamat banget. Dijemput pagi, sore sudah wangi dan terlipat rapi."
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold grid place-items-center">RA</span>
            <div>
              <p class="font-semibold text-sm">Rina Amelia</p>
              <p class="text-xs text-ink-soft">Ibu rumah tangga</p>
            </div>
          </figcaption>
        </figure>

        <!-- Card 2 -->
        <figure class="w-[320px] sm:w-[360px] shrink-0 p-7 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p class="text-sun tracking-widest">★★★★★</p>
          <blockquote class="mt-3 text-[15px] leading-relaxed text-ink/80">
            "Langganan bulanan bikin hemat pengeluaran. Anak kos kayak saya nggak perlu pusing nyuci pas lagi sibuk skripsi."
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-sun/30 text-ink font-bold grid place-items-center">DP</span>
            <div>
              <p class="font-semibold text-sm">Dimas Pratama</p>
              <p class="text-xs text-ink-soft">Mahasiswa</p>
            </div>
          </figcaption>
        </figure>

        <!-- Card 3 -->
        <figure class="w-[320px] sm:w-[360px] shrink-0 p-7 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p class="text-sun tracking-widest">★★★★★</p>
          <blockquote class="mt-3 text-[15px] leading-relaxed text-ink/80">
            "Handuk dan sprei hotel kami ditangani dengan sangat baik. Selalu tepat waktu, komunikasi admin juga cepat dan ramah."
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-mint/30 text-emerald-800 font-bold grid place-items-center">HS</span>
            <div>
              <p class="font-semibold text-sm">Hendra Saputra</p>
              <p class="text-xs text-ink-soft">Manajer Hotel Seruni</p>
            </div>
          </figcaption>
        </figure>

        <!-- Card 4 -->
        <figure class="w-[320px] sm:w-[360px] shrink-0 p-7 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p class="text-sun tracking-widest">★★★★★</p>
          <blockquote class="mt-3 text-[15px] leading-relaxed text-ink/80">
            "Sneakers putih saya yang sudah kusam balik kinclong lagi. Hasil cuci sepatunya juara dan nggak merusak bahan!"
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-rose-100 text-rose-700 font-bold grid place-items-center">SN</span>
            <div>
              <p class="font-semibold text-sm">Sarah Nabila</p>
              <p class="text-xs text-ink-soft">Karyawan swasta</p>
            </div>
          </figcaption>
        </figure>

        <!-- Duplicates for smooth infinite loop -->
        <figure class="w-[320px] sm:w-[360px] shrink-0 p-7 rounded-3xl bg-white border border-brand-50 shadow-card" aria-hidden="true">
          <p class="text-sun tracking-widest">★★★★★</p>
          <blockquote class="mt-3 text-[15px] leading-relaxed text-ink/80">
            "Sebagai ibu dua anak, Nuy Laundry penyelamat banget. Dijemput pagi, sore sudah wangi dan terlipat rapi."
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold grid place-items-center">RA</span>
            <div>
              <p class="font-semibold text-sm">Rina Amelia</p>
              <p class="text-xs text-ink-soft">Ibu rumah tangga</p>
            </div>
          </figcaption>
        </figure>

        <figure class="w-[320px] sm:w-[360px] shrink-0 p-7 rounded-3xl bg-white border border-brand-50 shadow-card" aria-hidden="true">
          <p class="text-sun tracking-widest">★★★★★</p>
          <blockquote class="mt-3 text-[15px] leading-relaxed text-ink/80">
            "Langganan bulanan bikin hemat pengeluaran. Anak kos kayak saya nggak perlu pusing nyuci pas lagi sibuk skripsi."
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-sun/30 text-ink font-bold grid place-items-center">DP</span>
            <div>
              <p class="font-semibold text-sm">Dimas Pratama</p>
              <p class="text-xs text-ink-soft">Mahasiswa</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
