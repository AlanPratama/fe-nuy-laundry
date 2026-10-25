<template>
  <TrackingPage />
</template>

<script setup lang="ts">
import TrackingPage from '~/features/tracking/pages/TrackingPage.vue'

useHead({
  title: 'Cek Status Resi Cucian — Nuy Laundry',
  meta: [
    {
      name: 'description',
      content: 'Lacak status cucianmu secara real-time. Pantau proses penjemputan, pencucian, setrika, hingga pakaian siap diantar ke rumahmu.'
    }
  ]
})
</script>
