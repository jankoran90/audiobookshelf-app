<template>
  <div class="contents">
  <div v-if="isOpen" class="fixed inset-0 z-30 flex flex-col" :style="{ background: coverBg }">
    <!-- Cover art -->
    <div class="flex-1 flex items-center justify-center px-8 pt-8">
      <div class="w-full max-w-xs aspect-square rounded-3xl overflow-hidden shadow-2xl">
        <img v-if="coverUrl" :src="coverUrl" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full bg-bg-hover flex items-center justify-center">
          <span class="material-symbols text-8xl text-fg-muted">auto_stories</span>
        </div>
      </div>
    </div>

    <!-- Title -->
    <div class="px-8 py-4 text-center">
      <p class="text-xl font-bold text-fg leading-tight line-clamp-2">{{ title }}</p>
      <p class="text-base text-fg-muted mt-1 line-clamp-1">{{ subtitle }}</p>
    </div>

    <!-- Progress bar -->
    <div class="px-8 mb-2">
      <div class="h-2 rounded-full bg-white/20">
        <div class="h-full rounded-full bg-accent transition-all" :style="{ width: progressPercent + '%' }" />
      </div>
      <div class="flex justify-between mt-1">
        <p class="text-xs text-fg-muted">{{ formatTime(currentTime) }}</p>
        <p class="text-xs text-fg-muted">-{{ formatTime(timeRemaining) }}</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-8 pb-12">
      <button class="w-16 h-16 flex items-center justify-center" @click="rewind">
        <span class="material-symbols text-5xl text-fg">replay_30</span>
      </button>
      <button class="w-24 h-24 rounded-full bg-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform" @click="playPause">
        <span class="material-symbols text-6xl text-white">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
      </button>
      <button class="w-16 h-16 flex items-center justify-center" @click="forward">
        <span class="material-symbols text-5xl text-fg">forward_30</span>
      </button>
    </div>
  </div>

  <!-- Mini player (when minimized) -->
  <div v-else-if="isOpen !== null && currentPlaybackSession" class="fixed bottom-0 left-0 right-0 z-30 bg-primary h-20 flex items-center px-4 gap-3 shadow-lg" @click="open = true">
    <div class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-bg-hover">
      <img v-if="coverUrl" :src="coverUrl" class="w-full h-full object-cover" />
      <span v-else class="material-symbols text-2xl text-fg-muted flex items-center justify-center w-full h-full">auto_stories</span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold text-fg truncate">{{ title }}</p>
      <p class="text-xs text-fg-muted truncate">{{ subtitle }}</p>
    </div>
    <button class="w-12 h-12 flex items-center justify-center" @click.stop="playPause">
      <span class="material-symbols text-4xl text-fg">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
    </button>
  </div>
  </div>
</template>

<script>
import { AbsAudioPlayer } from '@/plugins/capacitor'
import { usePlayer } from '@/composables/usePlayer'

export default {
  setup() {
    return { ...usePlayer() }
  },
  data() {
    return {
      open: false
    }
  },
  computed: {
    currentPlaybackSession() {
      return this.$store.state.currentPlaybackSession
    },
    isOpen() {
      if (!this.currentPlaybackSession) return null
      return this.open
    },
    serverAddress() {
      return this.$store.state.user.serverConnectionConfig?.address || ''
    },
    userToken() {
      return this.$store.getters['user/getToken']
    },
    coverUrl() {
      if (!this.currentPlaybackSession) return null
      const id = this.currentPlaybackSession.libraryItemId
      if (!id) return null
      return `${this.serverAddress}/api/items/${id}/cover?token=${this.userToken}&width=400`
    },
    coverBg() {
      return `rgb(${this.coverRgb || '30,30,30'})`
    },
    title() {
      return this.currentPlaybackSession?.displayTitle || ''
    },
    subtitle() {
      return this.currentPlaybackSession?.displayAuthor || ''
    },
    progressPercent() {
      return this.totalDuration > 0 ? (this.currentTime / this.totalDuration) * 100 : 0
    }
  },
  methods: {
    async playPause() {
      await AbsAudioPlayer.playPause()
    },
    async rewind() {
      await AbsAudioPlayer.seekBackward({ value: 30 })
    },
    async forward() {
      await AbsAudioPlayer.seekForward({ value: 30 })
    },
    formatTime(secs) {
      if (!secs || isNaN(secs)) return '0:00'
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = Math.floor(secs % 60)
      if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      return `${m}:${String(s).padStart(2, '0')}`
    }
  }
}
</script>
