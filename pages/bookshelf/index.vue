<template>
  <div class="w-full h-full min-h-full relative">

    <!-- PODCAST LIBRARY: in-progress episodes -->
    <template v-if="isPodcastLibrary">
      <!-- Sort & filter toolbar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg sticky top-0 z-10">
        <!-- Sort dropdown -->
        <div class="relative">
          <button class="flex items-center gap-1 h-7 px-2.5 rounded-full border border-border text-xs text-fg-muted" @click="showSortMenu = !showSortMenu">
            <span class="material-symbols text-sm leading-none">sort</span>
            <span>{{ sortLabels[sortBy] }}</span>
          </button>
          <div v-if="showSortMenu" class="absolute top-9 left-0 bg-bg border border-border rounded-lg shadow-xl z-20 min-w-40">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm"
              :class="sortBy === opt.value ? 'text-fg font-semibold' : 'text-fg-muted'"
              @click="sortBy = opt.value; showSortMenu = false"
            >
              <span class="material-symbols text-base leading-none">{{ sortBy === opt.value ? 'radio_button_checked' : 'radio_button_unchecked' }}</span>
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Podcast filter chips -->
        <div class="flex gap-1.5 overflow-x-auto flex-1 no-scrollbar">
          <button
            class="whitespace-nowrap h-7 px-2.5 rounded-full border text-xs flex-shrink-0"
            :class="filterPodcast === null ? 'border-success text-success' : 'border-border text-fg-muted'"
            @click="filterPodcast = null"
          >
            Vše
          </button>
          <button
            v-for="name in podcastNames"
            :key="name"
            class="whitespace-nowrap h-7 px-2.5 rounded-full border text-xs flex-shrink-0"
            :class="filterPodcast === name ? 'border-success text-success' : 'border-border text-fg-muted'"
            @click="filterPodcast = filterPodcast === name ? null : name"
          >
            {{ name }}
          </button>
        </div>
      </div>

      <!-- Episode count -->
      <div class="px-4 py-1.5 text-xs text-fg-muted">
        {{ filteredEpisodes.length }} epizod
      </div>

      <!-- Episode list -->
      <div v-if="isLoading" class="w-full pt-8 flex justify-center">
        <widgets-loading-spinner />
      </div>
      <template v-else-if="filteredEpisodes.length">
        <tables-podcast-in-progress-episode-row
          v-for="ep in filteredEpisodes"
          :key="ep.id"
          :library-item-id="ep.libraryItemId"
          :episode="ep"
          :local-library-item-id="localEpisodeMap[ep.id]?.localLibraryItemId"
          :local-episode="localEpisodeMap[ep.id]"
          @markedFinished="onEpisodeMarkedFinished"
        />
        <div v-if="hasMore" class="flex justify-center py-4">
          <button class="text-sm text-fg-muted border border-border rounded-full px-4 py-1.5" @click="loadMore">
            Načíst další
          </button>
        </div>
      </template>
      <div v-else class="w-full flex flex-col items-center justify-center py-16 text-center px-8">
        <span class="material-symbols text-5xl text-fg-muted mb-3">done_all</span>
        <p class="text-lg font-semibold">Vše poslechnuto!</p>
        <p class="text-sm text-fg-muted mt-1">Žádné nedoposlouchané epizody.</p>
      </div>
    </template>

    <!-- NON-PODCAST LIBRARY: original shelf view -->
    <template v-else>
      <div v-if="attemptingConnection" class="w-full pt-4 flex items-center justify-center">
        <widgets-loading-spinner />
        <p class="pl-4">{{ $strings.MessageAttemptingServerConnection }}</p>
      </div>
      <div v-if="shelves.length && isLoading" class="w-full pt-4 flex items-center justify-center">
        <widgets-loading-spinner />
        <p class="pl-4">{{ $strings.MessageLoadingServerData }}</p>
      </div>
      <div class="w-full" :class="{ 'py-6': altViewEnabled }">
        <template v-for="(shelf, index) in shelves">
          <bookshelf-shelf :key="shelf.id" :label="getShelfLabel(shelf)" :entities="shelf.entities" :type="shelf.type" :style="{ zIndex: shelves.length - index }" />
        </template>
      </div>
      <div v-if="!shelves.length && !isLoading" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div>
          <p class="mb-4 text-center text-xl">{{ $strings.MessageBookshelfEmpty }}</p>
          <div class="w-full" v-if="!user">
            <div class="flex justify-center items-center mb-3">
              <span class="material-symbols text-error text-lg">cloud_off</span>
              <p class="pl-2 text-error text-sm">{{ $strings.MessageAudiobookshelfServerNotConnected }}</p>
            </div>
          </div>
          <div class="flex justify-center">
            <ui-btn v-if="!user" small @click="$router.push('/connect')" class="w-32">{{ $strings.ButtonConnect }}</ui-btn>
          </div>
        </div>
      </div>
      <div v-else-if="!shelves.length && isLoading && !attemptingConnection" class="absolute top-0 left-0 z-50 w-full h-full flex items-center justify-center">
        <ui-loading-indicator :text="$strings.MessageLoading" />
      </div>
    </template>

    <!-- backdrop for sort dropdown -->
    <div v-if="showSortMenu" class="fixed inset-0 z-10" @click="showSortMenu = false" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Podcast in-progress view
      isLoading: false,
      episodes: [],
      localLibraryItems: [],
      loadedLibraryId: null,
      currentPage: 0,
      hasMore: false,
      sortBy: 'date',
      filterPodcast: null,
      showSortMenu: false,
      sortOptions: [
        { value: 'date', label: 'Datum vydání' },
        { value: 'remaining', label: 'Zbývající čas' },
        { value: 'podcast', label: 'Název podcastu' }
      ],
      sortLabels: {
        date: 'Datum',
        remaining: 'Zbývající čas',
        podcast: 'Podcast'
      },
      // Shelf view (non-podcast)
      shelves: [],
      isFirstNetworkConnection: true,
      lastServerFetch: 0,
      lastServerFetchLibraryId: null,
      lastLocalFetch: 0,
      localLibraryItemsAll: []
    }
  },
  computed: {
    user() {
      return this.$store.state.user.user
    },
    networkConnected() {
      return this.$store.state.networkConnected
    },
    currentLibraryId() {
      return this.$store.state.libraries.currentLibraryId
    },
    currentLibraryMediaType() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType']
    },
    isPodcastLibrary() {
      return this.currentLibraryMediaType === 'podcast'
    },
    altViewEnabled() {
      return this.$store.getters['getAltViewEnabled']
    },
    attemptingConnection() {
      return this.$store.state.attemptingConnection
    },
    // Podcast: local episode map
    localEpisodes() {
      const episodes = []
      this.localLibraryItems.forEach((li) => {
        if (li.media.episodes?.length) {
          li.media.episodes.forEach((ep) => {
            ep.localLibraryItemId = li.id
            episodes.push(ep)
          })
        }
      })
      return episodes
    },
    localEpisodeMap() {
      const map = {}
      this.localEpisodes.forEach((ep) => {
        if (ep.serverEpisodeId) map[ep.serverEpisodeId] = ep
      })
      return map
    },
    // Filter out episodes at 95%+ progress
    unfinishedEpisodes() {
      return this.episodes.filter((ep) => {
        const progress = this.$store.getters['user/getUserMediaProgress'](ep.libraryItemId, ep.id)
        if (!progress) return true
        if (progress.isFinished) return false
        return progress.progress < 0.95
      })
    },
    podcastNames() {
      const names = [...new Set(this.unfinishedEpisodes.map((ep) => ep.podcast?.metadata?.title).filter(Boolean))]
      return names.sort()
    },
    filteredEpisodes() {
      let list = this.unfinishedEpisodes
      if (this.filterPodcast) {
        list = list.filter((ep) => ep.podcast?.metadata?.title === this.filterPodcast)
      }
      if (this.sortBy === 'remaining') {
        return [...list].sort((a, b) => {
          const progA = this.$store.getters['user/getUserMediaProgress'](a.libraryItemId, a.id)
          const progB = this.$store.getters['user/getUserMediaProgress'](b.libraryItemId, b.id)
          const remA = progA ? (progA.duration || a.duration) - progA.currentTime : a.duration
          const remB = progB ? (progB.duration || b.duration) - progB.currentTime : b.duration
          return remA - remB
        })
      }
      if (this.sortBy === 'podcast') {
        return [...list].sort((a, b) => {
          const titleA = a.podcast?.metadata?.title || ''
          const titleB = b.podcast?.metadata?.title || ''
          return titleA.localeCompare(titleB)
        })
      }
      // Default: date (API order, newest first)
      return list
    }
  },
  watch: {
    networkConnected(newVal) {
      if (!this.isPodcastLibrary) {
        if (newVal) {
          if (this.isFirstNetworkConnection) {
            this.isFirstNetworkConnection = false
            this.fetchCategories()
            return
          }
          setTimeout(() => this.fetchCategories(), 4000)
        } else {
          this.fetchCategories()
        }
      }
    },
    user(newVal, oldVal) {
      if (!this.isPodcastLibrary && ((newVal && !oldVal) || (!newVal && oldVal))) {
        this.fetchCategories()
      }
    }
  },
  methods: {
    // ─── Podcast in-progress methods ──────────────────────────────────────
    async loadInProgressEpisodes(page = 0) {
      if (!this.currentLibraryId) return
      this.loadedLibraryId = this.currentLibraryId
      this.isLoading = true
      const payload = await this.$nativeHttp
        .get(`/api/libraries/${this.currentLibraryId}/recent-episodes?limit=100&page=${page}`)
        .catch((error) => {
          console.error('Failed to get recent episodes', error)
          return null
        })
      this.isLoading = false
      if (!payload) return
      if (page === 0) {
        this.episodes = payload.episodes || []
      } else {
        this.episodes.push(...(payload.episodes || []))
      }
      this.currentPage = page
      this.hasMore = this.episodes.length < (payload.total || 0)
    },
    loadMore() {
      this.loadInProgressEpisodes(this.currentPage + 1)
    },
    async loadLocalPodcastItems() {
      this.localLibraryItems = await this.$db.getLocalLibraryItems('podcast')
    },
    onEpisodeMarkedFinished(episodeId) {
      this.episodes = this.episodes.filter((ep) => ep.id !== episodeId)
    },
    // ─── Shelf methods (non-podcast) ──────────────────────────────────────
    getShelfLabel(shelf) {
      if (shelf.labelStringKey && this.$strings[shelf.labelStringKey]) return this.$strings[shelf.labelStringKey]
      return shelf.label
    },
    getLocalMediaItemCategories() {
      const localMedia = this.localLibraryItemsAll
      if (!localMedia?.length) return []
      const categories = []
      const books = []
      const booksContinueListening = []
      localMedia.forEach((item) => {
        if (item.mediaType === 'book') {
          item.progress = this.$store.getters['globals/getLocalMediaProgressById'](item.id)
          if (item.progress && !item.progress.isFinished && item.progress.progress > 0) booksContinueListening.push(item)
          books.push(item)
        }
      })
      if (booksContinueListening.length) {
        categories.push({
          id: 'local-books-continue',
          label: this.$strings.LabelContinueBooks,
          type: 'book',
          localOnly: true,
          entities: booksContinueListening.sort((a, b) => (b.progress?.lastUpdate > a.progress?.lastUpdate ? 1 : -1))
        })
      }
      if (books.length) {
        categories.push({
          id: 'local-books',
          label: this.$strings.LabelLocalBooks,
          type: 'book',
          entities: books.sort((a, b) => {
            if (a.progress?.isFinished) return 1
            if (b.progress?.isFinished) return -1
            if (a.progress && b.progress) return b.progress.lastUpdate > a.progress.lastUpdate ? 1 : -1
            return 0
          })
        })
      }
      return categories
    },
    async fetchCategories() {
      const isConnectedToServerWithInternet = this.user && this.currentLibraryId && this.networkConnected
      if (isConnectedToServerWithInternet) {
        if (this.lastServerFetch && Date.now() - this.lastServerFetch < 5000 && this.lastServerFetchLibraryId === this.currentLibraryId) return
        this.lastServerFetchLibraryId = this.currentLibraryId
        this.lastServerFetch = Date.now()
        this.lastLocalFetch = 0
      } else {
        if (this.lastLocalFetch && Date.now() - this.lastLocalFetch < 5000) return
        this.lastServerFetchLibraryId = null
        this.lastServerFetch = 0
        this.lastLocalFetch = Date.now()
      }
      this.isLoading = true
      this.localLibraryItemsAll = await this.$db.getLocalLibraryItems()
      const localCategories = this.getLocalMediaItemCategories()
      this.shelves = localCategories
      if (isConnectedToServerWithInternet) {
        const categories = await this.$nativeHttp
          .get(`/api/libraries/${this.currentLibraryId}/personalized?minified=1&include=rssfeed,numEpisodesIncomplete`, { connectTimeout: 10000 })
          .catch(() => [])
        if (!categories.length) {
          this.lastServerFetch = 0
          this.lastLocalFetch = Date.now()
          this.isLoading = false
          return
        }
        this.shelves = categories.map((cat) => {
          if (['book', 'podcast', 'episode'].includes(cat.type)) {
            cat.entities = cat.entities.map((entity) => {
              const lli = this.localLibraryItemsAll.find((l) => l.libraryItemId === entity.id)
              if (lli) entity.localLibraryItem = lli
              return entity
            })
          }
          return cat
        })
        const localShelves = localCategories.filter((cat) => cat.type === this.currentLibraryMediaType && !cat.localOnly)
        this.shelves.push(...localShelves)
      }
      this.isLoading = false
    },
    // ─── Shared ───────────────────────────────────────────────────────────
    libraryChanged() {
      if (!this.currentLibraryId) return
      if (this.isPodcastLibrary) {
        this.episodes = []
        this.filterPodcast = null
        this.loadInProgressEpisodes()
        this.loadLocalPodcastItems()
      } else {
        this.fetchCategories()
      }
    }
  },
  async mounted() {
    if (this.$route.query.error) {
      this.$toast.error(this.$route.query.error)
    }
    await this.$store.dispatch('globals/loadLocalMediaProgress')
    if (this.isPodcastLibrary) {
      this.loadInProgressEpisodes()
      this.loadLocalPodcastItems()
    } else {
      this.fetchCategories()
    }
    this.$eventBus.$on('library-changed', this.libraryChanged)
  },
  beforeDestroy() {
    this.$eventBus.$off('library-changed', this.libraryChanged)
  }
}
</script>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
