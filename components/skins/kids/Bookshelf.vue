<template>
  <div class="w-full h-full overflow-y-auto px-4 py-4">
    <div v-if="isLoading" class="flex justify-center items-center h-32">
      <div class="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
    <div v-else-if="!items.length" class="flex flex-col items-center justify-center h-40 text-fg-muted gap-3">
      <span class="material-symbols text-5xl">auto_stories</span>
      <p class="text-lg">Žádné knihy k poslechu</p>
    </div>
    <div v-else class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl overflow-hidden bg-secondary cursor-pointer active:scale-95 transition-transform"
        @click="openItem(item)"
      >
        <div class="aspect-square w-full bg-bg-hover relative">
          <img v-if="coverUrl(item)" :src="coverUrl(item)" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols text-5xl text-fg-muted">auto_stories</span>
          </div>
          <div v-if="progress(item)" class="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div class="h-full bg-accent transition-all" :style="{ width: progress(item) * 100 + '%' }" />
          </div>
        </div>
        <div class="p-2.5">
          <p class="text-sm font-bold text-fg leading-tight line-clamp-2">{{ itemTitle(item) }}</p>
          <p v-if="itemSubtitle(item)" class="text-xs text-fg-muted mt-1 line-clamp-1">{{ itemSubtitle(item) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      items: []
    }
  },
  computed: {
    currentLibraryId() {
      return this.$store.state.libraries.currentLibraryId
    },
    serverAddress() {
      return this.$store.state.user.serverConnectionConfig?.address || ''
    },
    userToken() {
      return this.$store.getters['user/getToken']
    }
  },
  watch: {
    currentLibraryId(newVal) {
      if (newVal) this.loadItems()
    }
  },
  mounted() {
    if (this.currentLibraryId) this.loadItems()
  },
  methods: {
    async loadItems() {
      this.isLoading = true
      this.items = []
      try {
        const data = await this.$nativeHttp.get(`/api/libraries/${this.currentLibraryId}/items?limit=100&sort=addedAt&desc=1`).catch(() => null)
        if (data?.results) this.items = data.results
      } finally {
        this.isLoading = false
      }
    },
    coverUrl(item) {
      if (!item.media?.coverPath) return null
      return `${this.serverAddress}/api/items/${item.id}/cover?token=${this.userToken}&width=200`
    },
    itemTitle(item) {
      return item.media?.metadata?.title || item.media?.metadata?.name || 'Bez názvu'
    },
    itemSubtitle(item) {
      return item.media?.metadata?.authorName || item.media?.metadata?.author || null
    },
    progress(item) {
      const p = this.$store.getters['user/getUserMediaProgress'](item.id, null)
      return p?.progress || 0
    },
    openItem(item) {
      this.$router.push(`/item/${item.id}`)
    }
  }
}
</script>
