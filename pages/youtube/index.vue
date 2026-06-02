<template>
  <div class="w-full min-h-full bg-bg pb-32">
    <!-- Hlavička -->
    <div class="px-4 pt-4 pb-2 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-fg">YouTube</h1>
      <button class="flex items-center gap-1 h-8 px-3 rounded-full bg-success/20 text-success text-sm" @click="showAddModal = true">
        <span class="material-symbols text-base leading-none">add</span>
        Přidat kanál
      </button>
    </div>

    <!-- Prázdný stav -->
    <div v-if="!channels.length" class="flex flex-col items-center justify-center pt-20 gap-4 text-fg-muted">
      <span class="material-symbols text-5xl">smart_display</span>
      <p class="text-sm">Žádné kanály. Přidej první.</p>
      <button class="h-10 px-5 rounded-full bg-success text-bg text-sm font-medium" @click="showAddModal = true">
        Přidat kanál
      </button>
    </div>

    <!-- Seznam kanálů -->
    <div v-else class="px-4 flex flex-col gap-3 mt-2">
      <div
        v-for="(ch, i) in channels"
        :key="ch.id"
        class="flex items-center gap-3 bg-secondary rounded-2xl p-3 cursor-pointer active:opacity-70"
        @click="$router.push(`/youtube/${i}`)"
      >
        <img v-if="ch.thumbnail" :src="ch.thumbnail" class="w-16 h-12 rounded-lg object-cover flex-shrink-0 bg-bg-hover" />
        <div v-else class="w-16 h-12 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0">
          <span class="material-symbols text-2xl text-fg-muted">smart_display</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-fg truncate">{{ ch.name }}</p>
          <p class="text-xs text-fg-muted truncate mt-0.5">{{ ch.feedUrl }}</p>
        </div>
        <button class="p-1.5 text-fg-muted" @click.stop="removeChannel(i)">
          <span class="material-symbols text-lg leading-none">delete</span>
        </button>
      </div>
    </div>

    <!-- Modal: přidat kanál -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-black/60 flex items-end" @click.self="showAddModal = false">
      <div class="w-full bg-bg rounded-t-2xl p-5 pb-8">
        <h2 class="text-base font-semibold text-fg mb-4">Přidat YouTube kanál</h2>
        <label class="block text-xs text-fg-muted mb-1">URL kanálu, playlistu nebo @handle</label>
        <input
          v-model="addInput"
          type="url"
          placeholder="https://www.youtube.com/@autocezet nebo playlist URL"
          class="w-full bg-bg-hover text-fg text-sm rounded-xl px-4 py-3 border border-border outline-none focus:border-success mb-1"
          @keyup.enter="addChannel"
        />
        <p v-if="addError" class="text-xs text-error mb-2">{{ addError }}</p>
        <label class="block text-xs text-fg-muted mt-3 mb-1">Název (volitelný)</label>
        <input
          v-model="addName"
          type="text"
          placeholder="Např. Auto.cz – Martin Vaculík"
          class="w-full bg-bg-hover text-fg text-sm rounded-xl px-4 py-3 border border-border outline-none focus:border-success"
        />
        <div class="flex gap-3 mt-4">
          <button class="flex-1 h-11 rounded-xl bg-bg-hover text-fg-muted text-sm" @click="showAddModal = false">Zrušit</button>
          <button class="flex-1 h-11 rounded-xl bg-success text-bg text-sm font-medium" :disabled="!addInput.trim()" @click="addChannel">Přidat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const DEFAULT_CHANNELS = [
  {
    id: 'autocz',
    name: 'Auto.cz – Martin Vaculík',
    feedUrl: 'https://www.youtube.com/playlist?list=PLcV5NDlkgJcSldc7Ktq5JWWAUCCUqwMmE',
    thumbnail: 'https://i.ytimg.com/vi/0-ZdWg85oZA/hqdefault.jpg',
  },
]

export default {
  data() {
    return {
      channels: [],
      showAddModal: false,
      addInput: '',
      addName: '',
      addError: '',
    }
  },
  mounted() {
    this.loadChannels()
  },
  methods: {
    loadChannels() {
      try {
        const saved = localStorage.getItem('yt_channels')
        this.channels = saved ? JSON.parse(saved) : DEFAULT_CHANNELS
      } catch {
        this.channels = DEFAULT_CHANNELS
      }
    },
    saveChannels() {
      localStorage.setItem('yt_channels', JSON.stringify(this.channels))
    },
    addChannel() {
      const feedUrl = this.addInput.trim()
      if (!feedUrl) return
      if (!feedUrl.startsWith('http') && !feedUrl.startsWith('@')) {
        this.addError = 'Zadej platnou URL nebo @handle'
        return
      }
      this.addError = ''
      const name = this.addName.trim() || feedUrl
      this.channels.push({ id: Date.now().toString(), name, feedUrl, thumbnail: null })
      this.saveChannels()
      this.addInput = ''
      this.addName = ''
      this.showAddModal = false
    },
    removeChannel(i) {
      this.channels.splice(i, 1)
      this.saveChannels()
    },
  },
}
</script>
