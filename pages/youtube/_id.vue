<template>
  <div class="w-full min-h-full bg-bg pb-32">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center pt-20 gap-3 text-fg-muted">
      <span class="material-symbols text-4xl animate-spin">progress_activity</span>
      <p class="text-sm">Načítám videa…</p>
    </div>

    <!-- Chyba -->
    <div v-else-if="error" class="flex flex-col items-center justify-center pt-20 gap-3 text-fg-muted px-6 text-center">
      <span class="material-symbols text-4xl text-error">error</span>
      <p class="text-sm text-error">{{ error }}</p>
      <button class="h-9 px-4 rounded-full bg-bg-hover text-sm text-fg" @click="loadFeed">Zkusit znovu</button>
    </div>

    <!-- Feed -->
    <template v-else>
      <!-- Kanál hlavička -->
      <div class="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-border">
        <img v-if="channelThumb" :src="channelThumb" class="w-10 h-10 rounded-full object-cover bg-bg-hover" />
        <div v-else class="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center">
          <span class="material-symbols text-xl text-fg-muted">smart_display</span>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-fg">{{ channelName }}</h2>
          <p class="text-xs text-fg-muted">{{ entries.length }} videí</p>
        </div>
      </div>

      <!-- Video karty -->
      <div class="flex flex-col gap-0">
        <div
          v-for="video in entries"
          :key="video.id"
          class="flex gap-3 px-4 py-3 border-b border-border/50 cursor-pointer active:bg-bg-hover"
          @click="openVideo(video)"
        >
          <!-- Thumbnail -->
          <div class="relative flex-shrink-0 w-28 h-[63px] rounded-lg overflow-hidden bg-bg-hover">
            <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" loading="lazy" />
            <div v-if="video.duration" class="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] rounded px-1 leading-4">
              {{ formatDuration(video.duration) }}
            </div>
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <p class="text-sm text-fg leading-snug line-clamp-2">{{ video.title }}</p>
            <p v-if="video.upload_date" class="text-xs text-fg-muted mt-1">{{ formatDate(video.upload_date) }}</p>
          </div>
          <!-- Download -->
          <button
            class="p-1 flex-shrink-0 self-center text-fg-muted active:text-fg"
            @click.stop="downloadVideoFile(video)"
          >
            <span v-if="downloadingId === video.id" class="material-symbols text-xl animate-spin">progress_activity</span>
            <span v-else class="material-symbols text-xl">download</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Video loading overlay (zobrazí se jen při načítání nebo chybě — TextureView překryje zbytek) -->
    <div v-if="activeVideo && (streamLoading || streamError)" class="fixed inset-0 z-[300] bg-black flex flex-col">
      <div class="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        <button class="p-1" @click="closeVideo">
          <span class="material-symbols text-2xl text-white">keyboard_arrow_down</span>
        </button>
        <p class="text-sm text-white flex-1 truncate">{{ activeVideo.title }}</p>
      </div>
      <div class="flex-1 flex items-center justify-center">
        <div v-if="streamLoading" class="flex flex-col items-center gap-3 text-white/70">
          <span class="material-symbols text-4xl animate-spin">progress_activity</span>
          <p class="text-sm">Načítám stream…</p>
        </div>
        <div v-else-if="streamError" class="flex flex-col items-center gap-3 text-white/70 px-6 text-center">
          <span class="material-symbols text-4xl text-red-400">error</span>
          <p class="text-sm text-red-400">{{ streamError }}</p>
          <button class="h-9 px-4 rounded-full bg-white/10 text-sm text-white" @click="fetchStream(activeVideo)">Zkusit znovu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { App } from '@capacitor/core'
import { AbsAudioPlayer } from '@/plugins/capacitor'
import { useYouTube } from '@/composables/useYouTube'
import { usePlayer } from '@/composables/usePlayer'

const DEFAULT_CHANNELS = [
  {
    id: 'autocz',
    name: 'Auto.cz – Martin Vaculík',
    feedUrl: 'https://www.youtube.com/playlist?list=PLcV5NDlkgJcSldc7Ktq5JWWAUCCUqwMmE',
    thumbnail: 'https://i.ytimg.com/vi/0-ZdWg85oZA/hqdefault.jpg',
  },
]

export default {
  setup() {
    const { getChannelFeed, getStreamUrl, getDownloadUrl, loading, error } = useYouTube()
    const { playUrl, clearVideo } = usePlayer()
    return { getChannelFeed, getStreamUrl, getDownloadUrl, loading, error, playUrl, clearVideo }
  },
  data() {
    return {
      channel: null,
      entries: [],
      channelName: '',
      channelThumb: null,
      activeVideo: null,
      streamLoading: false,
      streamError: null,
      backButtonListener: null,
      downloadingId: null,
    }
  },
  async mounted() {
    this.loadChannel()
    await this.loadFeed()
  },
  beforeDestroy() {
    this.removeBackListener()
  },
  methods: {
    loadChannel() {
      try {
        const saved = localStorage.getItem('yt_channels')
        const channels = saved ? JSON.parse(saved) : DEFAULT_CHANNELS
        this.channel = channels[parseInt(this.$route.params.id)] || null
      } catch {
        this.channel = null
      }
    },
    async loadFeed() {
      if (!this.channel) return
      const data = await this.getChannelFeed(this.channel.feedUrl, 30)
      if (data) {
        this.entries = data.entries || []
        this.channelName = data.channel || this.channel.name
        this.channelThumb = data.thumbnail || this.channel.thumbnail
      }
    },
    async openVideo(video) {
      this.activeVideo = video
      this.streamError = null
      await this.fetchStream(video)
    },
    async fetchStream(video) {
      this.streamLoading = true
      this.streamError = null
      try {
        const stream = await this.getStreamUrl(video.id)
        await this.playUrl(stream.url, { title: video.title, duration: stream.duration, isVideo: true })
        await AbsAudioPlayer.showVideoPlayer()
        this.addBackListener()
      } catch (e) {
        this.streamError = e.message || 'Chyba načítání streamu'
      } finally {
        this.streamLoading = false
      }
    },
    async closeVideo() {
      this.removeBackListener()
      try {
        await AbsAudioPlayer.hideVideoPlayer()
        await AbsAudioPlayer.closePlayback()
      } catch (_) {}
      this.clearVideo()
      this.activeVideo = null
      this.streamError = null
    },
    addBackListener() {
      this.removeBackListener()
      App.addListener('backButton', () => this.closeVideo()).then((handle) => {
        this.backButtonListener = handle
      })
    },
    removeBackListener() {
      if (this.backButtonListener) {
        this.backButtonListener.remove()
        this.backButtonListener = null
      }
    },
    async downloadVideoFile(video) {
      if (this.downloadingId) return
      this.downloadingId = video.id
      try {
        const { url } = await this.getDownloadUrl(video.id)
        await AbsAudioPlayer.downloadVideo({ url, title: video.title })
        this.$toast.success('Stahování spuštěno', { timeout: 2000 })
      } catch (e) {
        this.$toast.error('Nepodařilo se stáhnout video')
      } finally {
        this.downloadingId = null
      }
    },
    formatDuration(seconds) {
      if (!seconds) return ''
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return m >= 60
        ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`
    },
    formatDate(yyyymmdd) {
      if (!yyyymmdd || yyyymmdd.length !== 8) return ''
      return `${yyyymmdd.slice(6)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(0, 4)}`
    },
  },
}
</script>
