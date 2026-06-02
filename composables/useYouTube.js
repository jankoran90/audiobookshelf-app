import { ref } from 'vue'
import { CapacitorHttp } from '@capacitor/core'

const ANTENNA = 'https://antenna.jankoran.cz'

// InnerTube Android client — volá se přímo z telefonu (rezidentní IP, bez 429)
const INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
const INNERTUBE_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
  'X-YouTube-Client-Name': '3',
  'X-YouTube-Client-Version': '19.09.37',
}
const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '19.09.37',
    androidSdkVersion: 30,
    platform: 'MOBILE',
  },
}

export function useYouTube() {
  const channelFeed = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function getChannelFeed(feedUrl, limit = 20) {
    loading.value = true
    error.value = null
    try {
      const response = await CapacitorHttp.get({
        url: `${ANTENNA}/feed`,
        params: { channel: feedUrl, limit: String(limit) },
        connectTimeout: 10000,
        readTimeout: 90000,
      })
      if (response.status !== 200) throw new Error(`Feed error: ${response.status}`)
      channelFeed.value = response.data.entries || []
      return response.data
    } catch (e) {
      error.value = e.message || 'Chyba načítání feedu'
      return null
    } finally {
      loading.value = false
    }
  }

  async function getStreamUrl(videoId) {
    const response = await CapacitorHttp.post({
      url: INNERTUBE_URL,
      headers: INNERTUBE_HEADERS,
      data: { videoId, context: INNERTUBE_CONTEXT },
      connectTimeout: 10000,
      readTimeout: 30000,
    })
    if (response.status !== 200) throw new Error('InnerTube chyba')
    const data = response.data

    // Kombinované formáty (audio+video v jednom streamu, max 720p) — přímé přehrávání
    const formats = (data.streamingData?.formats || [])
      .filter((f) => f.url && f.mimeType?.startsWith('video'))
      .sort((a, b) => (b.height || 0) - (a.height || 0))

    if (!formats.length) throw new Error('Žádná stream URL nenalezena')

    return {
      url: formats[0].url,
      quality: `${formats[0].height || '?'}p`,
      title: data.videoDetails?.title,
      thumbnail: (data.videoDetails?.thumbnail?.thumbnails || []).slice(-1)[0]?.url,
      duration: parseInt(data.videoDetails?.lengthSeconds || '0'),
      isVideo: true,
    }
  }

  async function getDownloadUrl(videoId) {
    const response = await CapacitorHttp.post({
      url: INNERTUBE_URL,
      headers: INNERTUBE_HEADERS,
      data: { videoId, context: INNERTUBE_CONTEXT },
      connectTimeout: 10000,
      readTimeout: 30000,
    })
    if (response.status !== 200) throw new Error('InnerTube chyba')
    const data = response.data

    const formats = (data.streamingData?.formats || [])
      .filter((f) => f.url)
      .sort((a, b) => (b.height || 0) - (a.height || 0))

    if (!formats.length) throw new Error('Žádná download URL nenalezena')
    return { url: formats[0].url, title: data.videoDetails?.title }
  }

  return { channelFeed, loading, error, getChannelFeed, getStreamUrl, getDownloadUrl }
}
