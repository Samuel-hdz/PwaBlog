// Función para registrar el Service Worker
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("[SW] Service Worker registrado con éxito:", registration.scope)

          // Verificar si hay actualizaciones del Service Worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            console.log("[SW] Nueva versión del Service Worker encontrada")

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                console.log("[SW] Nueva versión disponible. Recarga la página para actualizar.")

                // Notificar al usuario que hay una actualización disponible
                if (window.confirm("Hay una nueva versión disponible. ¿Deseas actualizar?")) {
                  newWorker.postMessage({ type: "SKIP_WAITING" })
                  window.location.reload()
                }
              }
            })
          })
        })
        .catch((error) => {
          console.error("[SW] Error al registrar el Service Worker:", error)
        })

      // Detectar cuando un nuevo Service Worker se activa
      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    })
  } else {
    console.log("[SW] Service Workers no son soportados en este navegador.")
  }
}

// Función para desregistrar el Service Worker (útil para desarrollo)
export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
        console.log("[SW] Service Worker desregistrado")
      })
      .catch((error) => {
        console.error("[SW] Error al desregistrar:", error)
      })
  }
}

// Función para verificar el estado de conexión
export function checkOnlineStatus() {
  return navigator.onLine
}

export function clearCache() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" })
    console.log("[SW] Solicitud de limpieza de caché enviada")
  }
}

export async function getCacheInfo() {
  if ("caches" in window) {
    const cacheNames = await caches.keys()
    const cacheInfo = []

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      cacheInfo.push({
        name: cacheName,
        size: keys.length,
      })
    }

    return cacheInfo
  }
  return []
}
