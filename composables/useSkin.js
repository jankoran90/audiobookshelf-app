export const SKINS = {
  default: {
    id: 'default',
    label: 'Výchozí',
    theme: 'default',
    components: {
      appbar: 'AppAppbar',
      sideDrawer: 'AppSideDrawer',
      player: 'AppAudioPlayer',
      bookshelf: null
    },
    allowedRoutes: null
  },
  kids: {
    id: 'kids',
    label: 'Dětský režim 🧸',
    theme: 'kids',
    components: {
      appbar: 'SkinsKidsAppbar',
      sideDrawer: 'SkinsKidsSideDrawer',
      player: 'SkinsKidsAudioPlayer',
      bookshelf: 'SkinsKidsBookshelf'
    },
    allowedRoutes: ['/', '/bookshelf', '/bookshelf/*', '/item/*', '/downloads', '/localMedia/*']
  }
}

export function useSkin() {
  return { SKINS }
}
