export default function ({ store, route, redirect }) {
  const skin = store.getters['activeSkin']
  if (!skin.allowedRoutes) return
  if (!store.state.user?.user) return  // přihlašovací flow neblokovat
  const allowed = skin.allowedRoutes.some((pattern) => {
    if (pattern.endsWith('/*')) return route.path.startsWith(pattern.slice(0, -2))
    return route.path === pattern
  })
  if (!allowed) redirect('/bookshelf')
}
