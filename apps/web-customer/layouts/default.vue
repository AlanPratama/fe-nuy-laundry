<template>
  <div class="min-h-screen flex flex-col bg-white text-ink overflow-x-hidden">
    <LayoutNavbar />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutFooter />
    <UiFloatingWhatsApp />
  </div>
</template>
