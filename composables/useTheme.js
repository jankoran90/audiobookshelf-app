import { ref } from 'vue'

export const THEMES = ['default', 'black', 'light', 'kids']

const activeTheme = ref('default')

// useTheme vyžaduje $localStore (Capacitor Preferences wrapper) z Vue pluginu
export function useTheme(localStore) {
  function applyTheme(name) {
    activeTheme.value = name
    document.documentElement.dataset.theme = name === 'default' ? '' : name
  }

  async function setTheme(name) {
    applyTheme(name)
    if (localStore) await localStore.setTheme(name)
  }

  async function loadTheme() {
    if (!localStore) return
    const saved = await localStore.getTheme()
    if (saved) applyTheme(saved)
  }

  // Fáze 4: dynamický skin z API — injektuje CSS vars do <head>
  async function loadRemoteTheme(url) {
    const json = await fetch(url).then((r) => r.json())
    let el = document.getElementById('remote-theme')
    if (!el) {
      el = document.createElement('style')
      el.id = 'remote-theme'
      document.head.appendChild(el)
    }
    el.textContent = `:root { ${Object.entries(json)
      .map(([k, v]) => `${k}:${v}`)
      .join(';')} }`
  }

  return { activeTheme, THEMES, setTheme, loadTheme, loadRemoteTheme }
}
