import { ref, computed } from 'vue'

// Singleton — stav přehrávače sdílený napříč komponentami
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(0)
const bufferedTime = ref(0)
const currentPlaybackRate = ref(1)
const volume = ref(0.5)
const seekLoading = ref(false)
const isLoading = ref(false)
const isCheckingServerProgress = ref(false)
const coverRgb = ref('rgb(55, 56, 56)')
const coverBgIsLight = ref(false)
const isEnded = ref(false)
const syncStatus = ref(0)

const progress = computed(() => totalDuration.value > 0 ? currentTime.value / totalDuration.value : 0)

const timeRemaining = computed(() => totalDuration.value > 0 ? (totalDuration.value - currentTime.value) / currentPlaybackRate.value : 0)

export function usePlayer() {
  // Tyto funkce budou implementovány v Fázi 3 — delegují na AbsAudioPlayer (native bridge)
  function play() {
    // AbsAudioPlayer.play()
  }

  function pause() {
    // AbsAudioPlayer.pause()
  }

  function seek(seconds) {
    // AbsAudioPlayer.seek(seconds)
  }

  function setRate(rate) {
    currentPlaybackRate.value = rate
    // AbsAudioPlayer.setPlaybackSpeed(rate)
  }

  function setVolume(val) {
    volume.value = val
    // AbsAudioPlayer.setVolume(val)
  }

  return {
    isPlaying,
    currentTime,
    totalDuration,
    bufferedTime,
    currentPlaybackRate,
    volume,
    seekLoading,
    isLoading,
    isCheckingServerProgress,
    coverRgb,
    coverBgIsLight,
    isEnded,
    syncStatus,
    progress,
    timeRemaining,
    play,
    pause,
    seek,
    setRate,
    setVolume
  }
}
