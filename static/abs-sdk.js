/**
 * ABS Remote UI SDK
 * Vložit do remote frontendu pro komunikaci s ABS forkem přes postMessage.
 *
 * Použití:
 *   <script src="https://app.jankoran.cz/abs-sdk.js"></script>
 *   const auth = await absConnect()  // { token, serverUrl, userId }
 *   const result = await absCall('AbsAudioPlayer', 'prepareLibraryItem', { libraryItemId: '...' })
 */

;(function (root) {
  function absConnect() {
    return new Promise(function (resolve) {
      window.addEventListener('message', function handler(e) {
        if (e.data && e.data.type === 'abs-auth') {
          window.removeEventListener('message', handler)
          resolve(e.data)
        }
      })
      window.parent.postMessage({ type: 'abs-ready' }, '*')
    })
  }

  function absCall(plugin, method, args) {
    var id = Math.random().toString(36).slice(2)
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        window.removeEventListener('message', handler)
        reject(new Error('abs-call timeout: ' + plugin + '.' + method))
      }, 10000)
      function handler(e) {
        if (e.data && e.data.type === 'abs-result' && e.data.id === id) {
          clearTimeout(timer)
          window.removeEventListener('message', handler)
          if (e.data.data && e.data.data.error) {
            reject(new Error(e.data.data.error))
          } else {
            resolve(e.data.data)
          }
        }
      }
      window.addEventListener('message', handler)
      window.parent.postMessage({ type: 'abs-call', id: id, plugin: plugin, method: method, args: args || {} }, '*')
    })
  }

  function absOnEvent(eventName, callback) {
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'abs-event' && e.data.event === eventName) {
        callback(e.data.data)
      }
    })
  }

  root.absConnect = absConnect
  root.absCall = absCall
  root.absOnEvent = absOnEvent
})(window)
