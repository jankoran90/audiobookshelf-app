<template>
  <div class="fixed top-0 left-0 right-0 layout-wrapper w-full z-50 overflow-hidden pointer-events-none">
    <div class="absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-200" :class="show ? 'bg-opacity-60 pointer-events-auto' : 'bg-opacity-0'" @click="show = false" />
    <div class="absolute top-0 right-0 w-72 h-full bg-bg transform transition-transform py-8 pointer-events-auto" :class="show ? '' : 'translate-x-72'" @click.stop>
      <nuxt-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="w-full flex items-center gap-5 px-8 h-16 text-fg"
        :class="$route.path.startsWith(item.to) ? 'bg-bg-hover' : 'text-fg-muted'"
        @click.native="show = false"
      >
        <span class="material-symbols fill text-4xl">{{ item.icon }}</span>
        <p class="text-xl font-semibold">{{ item.label }}</p>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    show: {
      get() {
        return this.$store.state.showSideDrawer
      },
      set(val) {
        this.$store.commit('setShowSideDrawer', val)
      }
    },
    navItems() {
      return [
        { icon: 'home', label: this.$strings.ButtonHome || 'Domů', to: '/bookshelf' },
        { icon: 'download', label: this.$strings.HeaderDownloads || 'Stažené', to: '/downloads' }
      ]
    }
  }
}
</script>
