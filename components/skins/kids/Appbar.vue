<template>
  <div class="w-full h-20 bg-primary relative z-20 flex items-center px-4">
    <a v-if="showBack" @click="back" class="rounded-full h-12 w-12 flex items-center justify-center mr-3 cursor-pointer">
      <span class="material-symbols text-4xl text-fg">arrow_back</span>
    </a>
    <p class="text-2xl font-bold text-fg truncate flex-1 text-center" :class="showBack ? 'mr-12' : ''">{{ currentLibraryName || 'Audiobookshelf' }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    showBack() {
      return this.$route.path !== '/' && this.$route.path !== '/bookshelf'
    },
    currentLibraryName() {
      return this.$store.getters['libraries/getCurrentLibraryName']
    }
  },
  methods: {
    back() {
      this.$router.back()
    }
  }
}
</script>
