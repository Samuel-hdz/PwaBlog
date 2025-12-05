const CACHE_VERSION = "v5" // Incrementada versión para forzar actualización
const CACHE_STATIC = `blog-static-${CACHE_VERSION}`
const CACHE_DYNAMIC = `blog-dynamic-${CACHE_VERSION}`
const CACHE_API = `blog-api-${CACHE_VERSION}`
const CACHE_IMAGES = `blog-images-${CACHE_VERSION}` // Nuevo caché dedicado para imágenes

const APP_SHELL = ["/", "/index.html", "/manifest.json"]

// Instalación - cachear App Shell
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker optimizado...")
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log("[SW] Cacheando App Shell")
      return cache.addAll(APP_SHELL).catch((err) => {
        console.error("[SW] Error cacheando App Shell:", err)
      })
    }),
  )
  self.skipWaiting()
})

// Activación - limpiar cachés antiguas
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando Service Worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.includes("blog-") &&
            cacheName !== CACHE_STATIC &&
            cacheName !== CACHE_DYNAMIC &&
            cacheName !== CACHE_API &&
            cacheName !== CACHE_IMAGES // Agregado nuevo caché de imágenes
          ) {
            console.log("[SW] Eliminando caché antigua:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  return self.clients.claim()
})

// Estrategias de caché diferenciadas
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo manejar requests GET
  if (request.method !== "GET") return

  if (
    url.pathname.includes("/node_modules/") ||
    url.pathname.includes("/@") ||
    url.pathname.includes(".vite/deps") ||
    url.pathname.includes("/assets/")
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC))
    return
  }

  // Estrategia 1: Cache First para recursos estáticos (CSS, JS, imágenes, fonts)
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    url.pathname.match(/\.(css|js|jsx|ts|tsx|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC))
    return
  }

  if (
    request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif|ico)$/) ||
    url.hostname.includes("firebasestorage.googleapis.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    console.log("[SW] Detectada imagen:", url.href)
    event.respondWith(staleWhileRevalidateImages(request))
    return
  }

  // Estrategia 2: Network First con caché para API
  if (url.pathname.includes("/api/") || url.href.includes("/api/")) {
    console.log("[SW] Detectada petición API:", url.href)
    event.respondWith(networkFirstAPI(request))
    return
  }

  // Estrategia 3: Network First para navegación (HTML)
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  // Por defecto: Network First
  event.respondWith(networkFirst(request, CACHE_DYNAMIC))
})

// Cache First: intenta caché primero, luego red
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) {
    console.log("[SW] Cache First - Sirviendo desde caché:", request.url)
    return cached
  }

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
      console.log("[SW] Cache First - Guardado en caché:", request.url)
    }
    return response
  } catch (error) {
    console.log("[SW] Cache First - Error de red:", error)
    return new Response("Recurso no disponible offline", { status: 503 })
  }
}

async function cacheFirstImage(request) {
  const cached = await caches.match(request)
  if (cached) {
    console.log("[SW] Imagen desde caché:", request.url)
    return cached
  }

  try {
    const response = await fetch(request)
    if (response && response.ok && response.status === 200) {
      // Verificar que es realmente una imagen
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.startsWith("image/")) {
        const cache = await caches.open(CACHE_STATIC)
        cache.put(request, response.clone())
        console.log("[SW] Imagen guardada en caché:", request.url)
      }
      return response
    } else if (response.status === 404) {
      console.log("[SW] Imagen no encontrada (404):", request.url)
      return response
    }
    return response
  } catch (error) {
    console.log("[SW] Error cargando imagen, buscando en caché:", error)

    const cachedRetry = await caches.match(request)
    if (cachedRetry) {
      console.log("[SW] Imagen encontrada en caché tras error de red:", request.url)
      return cachedRetry
    }

    // Devolver una imagen placeholder gris
    return new Response(
      '<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="20">Imagen no disponible offline</text></svg>',
      {
        status: 200,
        headers: { "Content-Type": "image/svg+xml" },
      },
    )
  }
}

// Network First: intenta red primero, luego caché
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
      console.log("[SW] Network First - Actualizado en caché:", request.url)
    }
    return response
  } catch (error) {
    console.log("[SW] Network First - Fallback a caché:", request.url)
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    return new Response("Contenido no disponible offline", { status: 503 })
  }
}

// Network First para API con manejo especial
async function networkFirstAPI(request) {
  try {
    console.log("[SW] Intentando cargar API desde red:", request.url)
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_API)
      cache.put(request, response.clone())
      console.log("[SW] ✓ API cacheada exitosamente:", request.url)
    }
    return response
  } catch (error) {
    console.log("[SW] ⚠ API offline - Buscando en caché:", request.url)
    const cached = await caches.match(request)

    if (cached) {
      console.log("[SW] ✓ Encontrado en caché:", request.url)
      const clonedResponse = cached.clone()
      const body = await clonedResponse.json()

      // Si es un array de posts, agregamos la bandera offline
      let modifiedBody = body
      if (body.posts && Array.isArray(body.posts)) {
        modifiedBody = {
          ...body,
          offline: true,
          message: "Datos cargados desde caché (sin conexión)",
        }
      } else if (body._id) {
        // Si es un post individual
        modifiedBody = {
          ...body,
          offline: true,
        }
      }

      return new Response(JSON.stringify(modifiedBody), {
        headers: {
          "Content-Type": "application/json",
          "X-Offline-Data": "true",
        },
      })
    }

    console.log("[SW] ✗ No encontrado en caché:", request.url)
    // Si no hay caché, devolver respuesta indicando que no hay datos
    return new Response(
      JSON.stringify({
        offline: true,
        error: "No hay datos disponibles offline",
        posts: [],
        comments: [],
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Network First para navegación con fallback al App Shell
async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE_DYNAMIC)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    console.log("[SW] Navegación offline - Sirviendo App Shell")
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    // Fallback al index.html (App Shell)
    return caches.match("/")
  }
}

// Manejo de mensajes
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }),
    )
  }
})

async function staleWhileRevalidateImages(request) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok && response.status === 200) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.startsWith("image/")) {
          const cache = caches.open(CACHE_IMAGES)
          cache.then((c) => c.put(request, response.clone()))
          console.log("[SW] Imagen actualizada en caché:", request.url)
        }
      }
      return response
    })
    .catch((error) => {
      console.log("[SW] Error cargando imagen:", error)
      return null
    })

  // Devolver caché inmediatamente si existe, mientras actualiza en segundo plano
  if (cached) {
    console.log("[SW] Sirviendo imagen desde caché:", request.url)
    return cached
  }

  // Si no hay caché, esperar a la red
  const networkResponse = await fetchPromise
  if (networkResponse) {
    return networkResponse
  }

  // Si falla todo, devolver placeholder
  console.log("[SW] Imagen no disponible, devolviendo placeholder")
  return new Response(
    '<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="18">📷 Imagen no disponible</text></svg>',
    {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
    },
  )
}
