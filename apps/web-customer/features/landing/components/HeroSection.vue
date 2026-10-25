<template>
  <section id="home" class="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
    <!-- background decoration -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white"></div>
    <div class="absolute -top-24 -right-24 w-[420px] h-[420px] bg-brand-200/50 blob blur-3xl -z-10"></div>
    <div class="absolute top-1/2 -left-32 w-[320px] h-[320px] bg-sun/20 blob blur-3xl -z-10"></div>
    <canvas ref="bubbleCanvas" class="absolute inset-0 w-full h-full -z-10 pointer-events-none"></canvas>

    <div class="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 lg:gap-8 items-center">
      <!-- copy -->
      <div class="text-center lg:text-left">
        <span class="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-white shadow-card text-sm font-medium">
          <span class="px-2.5 py-0.5 rounded-full bg-sun text-ink text-xs font-bold">BARU</span>
          Gratis antar jemput radius 5 km
        </span>

        <h1 class="mt-6 text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.15] tracking-tight">
          Cucian Numpuk?<br class="hidden sm:block" />
          Serahkan ke <span class="relative inline-block text-brand-600">
            Nuy Laundry
            <svg class="absolute left-0 -bottom-2 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
              <path d="M2 9c60-6 180-8 296-3" stroke="#FFC93C" stroke-width="5" stroke-linecap="round"/>
            </svg>
          </span>
        </h1>

        <p class="mt-6 text-ink-soft text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
          Laundry kiloan & satuan yang bersih, wangi, dan rapi. Kami jemput di depan pintu, kamu tinggal santai — pakaian kembali siap pakai dalam 24 jam.
        </p>

        <div class="mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Nuy%20Laundry%2C%20saya%20mau%20jadwalkan%20penjemputan" 
            target="_blank" 
            rel="noopener" 
            class="px-8 py-4 rounded-full bg-brand-600 text-white font-semibold shadow-soft hover:bg-brand-700 hover:-translate-y-0.5 transition"
          >
            Jadwalkan Penjemputan
          </a>
          <NuxtLink 
            to="/tracking" 
            class="px-8 py-4 rounded-full bg-white text-ink font-semibold shadow-card hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
            Cek Status Resi
          </NuxtLink>
        </div>

        <!-- statistics -->
        <div class="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
          <div>
            <p class="text-2xl sm:text-3xl font-extrabold text-ink">12K+</p>
            <p class="text-xs sm:text-sm text-ink-soft mt-1">Pelanggan puas</p>
          </div>
          <div class="border-x border-brand-100">
            <p class="text-2xl sm:text-3xl font-extrabold text-ink">85K+</p>
            <p class="text-xs sm:text-sm text-ink-soft mt-1">Kg tercuci</p>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-extrabold text-ink flex items-center justify-center lg:justify-start gap-1">
              4.9 <span class="text-sun text-xl">★</span>
            </p>
            <p class="text-xs sm:text-sm text-ink-soft mt-1">Rating Google</p>
          </div>
        </div>
      </div>

      <!-- visual interactive washing machine -->
      <div class="relative mx-auto w-full max-w-[460px]">
        <div class="absolute inset-6 rounded-[3rem] bg-brand-600 rotate-6"></div>
        <div class="absolute inset-6 rounded-[3rem] bg-sun -rotate-3 opacity-90"></div>

        <!-- machine frame -->
        <div class="relative machine mx-auto w-[78%] aspect-[4/5] rounded-[2.5rem] bg-white shadow-card p-5 sm:p-6 flex flex-col">
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <span class="w-3 h-3 rounded-full bg-mint blink"></span>
              <span class="w-3 h-3 rounded-full bg-brand-100"></span>
              <span class="w-3 h-3 rounded-full bg-brand-100"></span>
            </div>
            <div class="px-3 py-1 rounded-lg bg-ink text-mint text-xs font-mono tracking-wider">00:42</div>
            <span class="w-8 h-8 rounded-full border-4 border-brand-100 relative">
              <span class="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-2 rounded bg-brand-600"></span>
            </span>
          </div>
          <div class="h-px bg-brand-50 my-5"></div>
          <div class="flex-1 grid place-items-center">
            <div class="relative w-[88%] aspect-square rounded-full bg-brand-50 p-3 sm:p-4 shadow-inner">
              <div class="w-full h-full rounded-full border-[10px] border-brand-200 overflow-hidden relative bg-gradient-to-br from-sky-100 to-brand-100">
                <!-- water -->
                <div class="water absolute -left-1/4 -right-1/4 top-[52%] bottom-[-20%] bg-brand-500/50 rounded-[45%]"></div>
                <!-- clothes spinning -->
                <div class="drum absolute inset-0">
                  <span class="absolute top-[18%] left-[30%] w-10 h-7 rounded-xl bg-sun"></span>
                  <span class="absolute top-[52%] left-[16%] w-8 h-8 rounded-full bg-rose-300"></span>
                  <span class="absolute top-[60%] left-[56%] w-11 h-6 rounded-lg bg-mint"></span>
                  <span class="absolute top-[28%] left-[60%] w-7 h-9 rounded-lg bg-brand-500"></span>
                </div>
                <div class="absolute top-[14%] left-[18%] w-6 h-10 rounded-full bg-white/60 rotate-[30deg]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- floating cards -->
        <div class="float-slow absolute -left-2 sm:-left-8 top-10 bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-mint/20 grid place-items-center">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
          <div>
            <p class="text-sm font-semibold leading-tight">Pesanan Selesai</p>
            <p class="text-xs text-ink-soft">6 kg • siap diantar</p>
          </div>
        </div>

        <div class="float-mid absolute -right-2 sm:-right-6 bottom-12 bg-white rounded-2xl shadow-card px-4 py-3">
          <p class="text-xs text-ink-soft">Mulai dari</p>
          <p class="text-lg font-extrabold text-brand-600 leading-tight">Rp6.000<span class="text-xs font-medium text-ink-soft">/kg</span></p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const bubbleCanvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

onMounted(() => {
  const canvas = bubbleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let w = 0
  let h = 0
  let bubbles: Array<{
    x: number
    y: number
    r: number
    speed: number
    drift: number
    alpha: number
  }> = []

  const makeBubble = (initial = false) => ({
    x: Math.random() * w,
    y: initial ? Math.random() * h : h + 20,
    r: 3 + Math.random() * 10,
    speed: 0.15 + Math.random() * 0.45,
    drift: Math.random() * Math.PI * 2,
    alpha: 0.15 + Math.random() * 0.25,
  })

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.offsetWidth
    h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = w < 640 ? 12 : 22
    bubbles = Array.from({ length: count }, () => makeBubble(true))
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    bubbles.forEach((b, i) => {
      b.y -= b.speed
      b.drift += 0.01
      b.x += Math.sin(b.drift) * 0.3
      if (b.y < -20) bubbles[i] = makeBubble(false)

      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(91, 91, 247, ${b.alpha})`
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha + 0.3})`
      ctx.fill()
    })
    animationId = requestAnimationFrame(draw)
  }

  resize()
  window.addEventListener('resize', resize)
  draw()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>
