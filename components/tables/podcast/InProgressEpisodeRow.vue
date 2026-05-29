<template>
  <div class="mx-3 my-1.5 rounded-2xl overflow-hidden relative bg-secondary active:opacity-80" @click.stop="goToEpisodePage">
    <!-- Cover + content row -->
    <div class="flex items-center gap-3 px-3.5 pt-3.5 pb-0">
      <div class="w-14 min-w-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
        <covers-preview-cover :src="coverSrc" :width="56" :book-cover-aspect-ratio="1" :show-resolution="false" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold leading-snug inprogress-title">{{ episodeTitle }}</p>
        <p class="text-xs text-fg-muted mt-0.5 truncate">{{ podcastTitle }}</p>

        <!-- Progress bar with remaining time -->
        <div v-if="itemProgressPercent > 0 && !userIsFinished" class="mt-2 flex items-center gap-2">
          <div class="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-warning rounded-full transition-all" :style="{ width: itemProgressPercent * 100 + '%' }" />
          </div>
          <span class="text-xs text-fg-muted flex-shrink-0 tabular-nums">{{ timeRemaining }}</span>
        </div>
        <p v-else class="text-xs text-fg-muted mt-1">{{ timeRemaining }}</p>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center gap-2 px-3.5 pt-2.5 pb-3.5">
      <button
        class="flex items-center justify-center gap-1 h-8 px-3 rounded-full text-sm font-semibold flex-shrink-0"
        :class="streamIsPlaying ? 'bg-white/10 text-fg' : 'bg-success/20 text-success'"
        @click.stop="playClick"
      >
        <span v-if="!playerIsStartingForThisMedia" class="material-symbols fill text-lg leading-none">{{ streamIsPlaying ? 'pause' : 'play_arrow' }}</span>
        <svg v-else class="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        <span v-if="streamIsPlaying">Přehrává se</span>
      </button>

      <button
        class="h-8 w-8 flex items-center justify-center rounded-full border border-border text-fg-muted flex-shrink-0"
        @click.stop="addToQueue"
      >
        <span class="material-symbols text-lg leading-none">add_to_queue</span>
      </button>

      <button
        class="h-8 w-8 flex items-center justify-center rounded-full border border-border text-fg-muted flex-shrink-0"
        @click.stop="addToPlaylist"
      >
        <span class="material-symbols text-lg leading-none">playlist_add</span>
      </button>

      <ui-read-icon-btn :disabled="isProcessingReadUpdate" :is-read="userIsFinished" borderless class="ml-auto" @click="toggleFinished" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    libraryItemId: String,
    episode: {
      type: Object,
      default: () => {}
    },
    localLibraryItemId: String,
    localEpisode: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isProcessingReadUpdate: false
    }
  },
  computed: {
    podcast() {
      return this.episode.podcast || {}
    },
    podcastTitle() {
      return this.podcast.metadata?.title || ''
    },
    episodeTitle() {
      return this.episode.title || ''
    },
    coverSrc() {
      return this.$store.getters['globals/getLibraryItemCoverSrcById'](this.libraryItemId)
    },
    isStreaming() {
      return this.$store.getters['getIsMediaStreaming'](this.libraryItemId, this.episode.id)
    },
    streamIsPlaying() {
      return this.$store.state.playerIsPlaying && this.isStreaming
    },
    playerIsStartingForThisMedia() {
      if (!this.episode?.id) return false
      return this.$store.state.playerStartingPlaybackMediaId === this.episode.id
    },
    playerIsStartingPlayback() {
      return this.$store.state.playerIsStartingPlayback
    },
    itemProgress() {
      if (this.localEpisode && this.localLibraryItemId) {
        return this.$store.getters['globals/getLocalMediaProgressById'](this.localLibraryItemId, this.localEpisode.id)
      }
      return this.$store.getters['user/getUserMediaProgress'](this.libraryItemId, this.episode.id)
    },
    itemProgressPercent() {
      return this.itemProgress?.progress || 0
    },
    userIsFinished() {
      return !!this.itemProgress?.isFinished
    },
    timeRemaining() {
      if (this.streamIsPlaying) return 'Přehrává se'
      if (!this.itemProgressPercent) return this.$elapsedPretty(this.episode.duration)
      if (this.userIsFinished) return 'Hotovo'
      const remaining = Math.floor((this.itemProgress.duration || this.episode.duration) - this.itemProgress.currentTime)
      return `${this.$elapsedPretty(remaining)} zbývá`
    }
  },
  methods: {
    goToEpisodePage() {
      this.$router.push(`/item/${this.libraryItemId}/${this.episode.id}`)
    },
    async playClick() {
      if (this.playerIsStartingPlayback) return
      await this.$hapticsImpact()
      if (this.streamIsPlaying) {
        this.$eventBus.$emit('pause-item')
      } else {
        this.$store.commit('setPlayerIsStartingPlayback', this.episode.id)
        if (this.localEpisode && this.localLibraryItemId) {
          this.$eventBus.$emit('play-item', {
            libraryItemId: this.localLibraryItemId,
            episodeId: this.localEpisode.id,
            serverLibraryItemId: this.libraryItemId,
            serverEpisodeId: this.episode.id
          })
        } else {
          this.$eventBus.$emit('play-item', {
            libraryItemId: this.libraryItemId,
            episodeId: this.episode.id
          })
        }
      }
    },
    addToQueue() {
      this.$hapticsImpact()
      this.$eventBus.$emit('add-to-queue', {
        libraryItemId: this.libraryItemId,
        episodeId: this.episode.id,
        title: this.episodeTitle,
        podcastTitle: this.podcastTitle,
        duration: this.episode.duration,
        description: this.episode.subtitle || this.episode.description || ''
      })
      this.$toast.success('Přidáno do fronty', { timeout: 1500 })
    },
    addToPlaylist() {
      this.$hapticsImpact()
      this.$eventBus.$emit('show-add-to-playlist', {
        libraryItemId: this.libraryItemId,
        episodeId: this.episode.id,
        title: this.episodeTitle,
        podcastTitle: this.podcastTitle
      })
    },
    async toggleFinished() {
      await this.$hapticsImpact()
      this.isProcessingReadUpdate = true
      const isFinished = !this.userIsFinished
      this.$nativeHttp
        .patch(`/api/me/progress/${this.libraryItemId}/${this.episode.id}`, { isFinished })
        .then(() => {
          if (isFinished) this.$emit('markedFinished', this.episode.id)
        })
        .catch((error) => {
          console.error('Failed to toggle finished', error)
          this.$toast.error('Nepodařilo se označit')
        })
        .finally(() => {
          this.isProcessingReadUpdate = false
        })
    }
  }
}
</script>

<style>
.inprogress-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
