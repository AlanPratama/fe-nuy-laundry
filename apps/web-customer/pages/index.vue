<template>
  <LandingPage />
</template>

<script setup lang="ts">
import LandingPage from '~/features/landing/pages/LandingPage.vue'

useHead({
  title: 'Nuy Laundry — Cucian Bersih, Wangi, Antar Jemput Gratis',
  meta: [
    {
      name: 'description',
      content: 'Nuy Laundry menyediakan jasa laundry kiloan, cuci setrika, express 6 jam, dry clean, sepatu & tas dengan antar jemput gratis dan standar 1 mesin 1 pelanggan.'
    }
  ]
})
</script>
