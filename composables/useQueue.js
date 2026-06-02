import { computed } from 'vue'

// useQueue obaluje Vuex store mutace — vyžaduje `store` jako parametr
// Fáze 3: komponenty importují useQueue(store) místo přímého $store.commit

export function useQueue(store) {
  const queue = computed(() => store.state.playerQueue)

  const current = computed(() => {
    if (!store.state.currentPlaybackSession) return null
    const s = store.state.currentPlaybackSession
    return queue.value.find((i) => i.libraryItemId === s.libraryItemId && i.episodeId === s.episodeId) || null
  })

  const upcoming = computed(() => {
    const session = store.state.currentPlaybackSession
    return queue.value
      .map((item, index) => ({ ...item, _queueIndex: index }))
      .filter((item) => {
        if (!session) return true
        return !(item.libraryItemId === session.libraryItemId && item.episodeId === session.episodeId)
      })
  })

  function addToQueue(episode) {
    store.commit('addToQueue', episode)
  }

  function setQueue(episodes) {
    store.commit('setQueue', episodes)
  }

  function removeFromQueue(index) {
    store.commit('removeFromQueue', index)
  }

  function removeFromQueueByEpisode(libraryItemId, episodeId) {
    store.commit('removeFromQueueByEpisode', { libraryItemId, episodeId })
  }

  function moveQueueItem(from, to) {
    store.commit('moveQueueItem', { from, to })
  }

  function shiftQueue() {
    store.commit('shiftQueue')
  }

  function clearQueue() {
    store.commit('clearQueue')
  }

  return {
    queue,
    current,
    upcoming,
    addToQueue,
    setQueue,
    removeFromQueue,
    removeFromQueueByEpisode,
    moveQueueItem,
    shiftQueue,
    clearQueue
  }
}
