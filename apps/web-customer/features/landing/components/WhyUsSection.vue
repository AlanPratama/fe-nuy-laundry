<template>
  <section class="py-20 lg:py-28 bg-brand-50/60 relative overflow-hidden">
    <div class="absolute -right-20 top-10 w-72 h-72 bg-brand-200/40 blob blur-3xl"></div>
    <div class="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
      <!-- visual bento grid -->
      <div class="order-2 lg:order-1 relative max-w-md mx-auto w-full">
        <div class="grid grid-cols-2 gap-5">
          <div class="space-y-5">
            <div class="rounded-3xl bg-brand-600 text-white p-6 aspect-square flex flex-col justify-end shadow-soft">
              <p class="text-4xl font-extrabold">24<span class="text-xl">jam</span></p>
              <p class="text-white/80 text-sm mt-1">Waktu pengerjaan reguler</p>
            </div>
            <div class="rounded-3xl bg-white shadow-card p-6">
              <p class="text-4xl font-extrabold text-brand-600">0</p>
              <p class="text-ink-soft text-sm mt-1">Biaya antar jemput</p>
            </div>
          </div>
          <div class="space-y-5 pt-10">
            <div class="rounded-3xl bg-white shadow-card p-6">
              <p class="text-4xl font-extrabold text-ink">100<span class="text-xl text-brand-600">%</span></p>
              <p class="text-ink-soft text-sm mt-1">Garansi cuci ulang</p>
            </div>
            <div class="rounded-3xl bg-sun p-6 aspect-square flex flex-col justify-end shadow-card">
              <p class="text-4xl font-extrabold text-ink">1:1</p>
              <p class="text-ink/75 text-sm mt-1">Satu mesin untuk satu pelanggan</p>
            </div>
          </div>
        </div>
      </div>

      <!-- copy -->
      <div class="order-1 lg:order-2">
        <p class="text-brand-600 font-semibold tracking-wide uppercase text-sm">Kenapa Nuy Laundry?</p>
        <h2 class="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">Bukan sekadar bersih, tapi juga diperlakukan dengan hati</h2>
        <p class="mt-4 text-ink-soft leading-relaxed">
          Kami tahu pakaian bukan cuma kain. Karena itu setiap cucian dipisah per pelanggan, dicek satu per satu, dan ditangani sesuai jenis bahannya.
        </p>

        <ul class="mt-8 space-y-5">
          <li class="flex gap-4">
            <span class="shrink-0 w-7 h-7 mt-0.5 rounded-full bg-brand-600 grid place-items-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </span>
            <div>
              <h4 class="font-bold text-ink">Tidak dicampur dengan cucian orang lain</h4>
              <p class="text-ink-soft text-[15px] mt-1">Satu mesin hanya untuk pesananmu — lebih higienis dan bebas tertukar.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="shrink-0 w-7 h-7 mt-0.5 rounded-full bg-brand-600 grid place-items-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </span>
            <div>
              <h4 class="font-bold text-ink">Deterjen & pewangi premium</h4>
              <p class="text-ink-soft text-[15px] mt-1">Ramah kulit sensitif dan bayi, wangi tahan hingga 7 hari di lemari.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="shrink-0 w-7 h-7 mt-0.5 rounded-full bg-brand-600 grid place-items-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </span>
            <div>
              <h4 class="font-bold text-ink">Lacak status real-time</h4>
              <p class="text-ink-soft text-[15px] mt-1">Cek status cucian kapan saja via website atau update otomatis ke WhatsApp.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
