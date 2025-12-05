// Utilidades para APIs nativas del navegador

// ==================== VIBRATION API ====================
export const vibrate = (pattern = 50) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern)
    return true
  }
  return false
}

// Patrones de vibración predefinidos
export const VIBRATION_PATTERNS = {
  short: 50,
  medium: 100,
  long: 200,
  success: [50, 100, 50],
  error: [100, 50, 100, 50, 100],
  notification: [200, 100, 200],
}

// ==================== CLIPBOARD API ====================
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return { success: true, message: "Copiado al portapapeles" }
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      return { success: true, message: "Copiado al portapapeles" }
    }
  } catch (error) {
    console.error("Error copiando al portapapeles:", error)
    return { success: false, message: "Error al copiar" }
  }
}

export const readFromClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText()
      return { success: true, text }
    }
    return { success: false, message: "API de portapapeles no disponible" }
  } catch (error) {
    console.error("Error leyendo del portapapeles:", error)
    return { success: false, message: "Error al leer del portapapeles" }
  }
}

// ==================== NOTIFICATION API ====================
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return { success: false, message: "Las notificaciones no están soportadas" }
  }

  if (Notification.permission === "granted") {
    return { success: true, permission: "granted" }
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return { success: permission === "granted", permission }
  }

  return { success: false, permission: Notification.permission }
}

export const showNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    console.log("Las notificaciones no están soportadas")
    return null
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      ...options,
    })
    return notification
  }

  return null
}

// ==================== INDEXEDDB ====================
const DB_NAME = "BlogCulturalDB"
const DB_VERSION = 1
const STORES = {
  savedPosts: "savedPosts",
  readingHistory: "readingHistory",
  preferences: "preferences",
}

let dbInstance = null

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Store para posts guardados
      if (!db.objectStoreNames.contains(STORES.savedPosts)) {
        const savedPostsStore = db.createObjectStore(STORES.savedPosts, { keyPath: "_id" })
        savedPostsStore.createIndex("savedAt", "savedAt", { unique: false })
        savedPostsStore.createIndex("category", "category", { unique: false })
      }

      // Store para historial de lectura
      if (!db.objectStoreNames.contains(STORES.readingHistory)) {
        const historyStore = db.createObjectStore(STORES.readingHistory, { keyPath: "postId" })
        historyStore.createIndex("visitedAt", "visitedAt", { unique: false })
      }

      // Store para preferencias de usuario
      if (!db.objectStoreNames.contains(STORES.preferences)) {
        db.createObjectStore(STORES.preferences, { keyPath: "key" })
      }
    }
  })
}

// Posts guardados
export const savePostToIndexedDB = async (post) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.savedPosts], "readwrite")
    const store = transaction.objectStore(STORES.savedPosts)

    const postWithTimestamp = {
      ...post,
      savedAt: new Date().toISOString(),
    }

    await store.put(postWithTimestamp)
    return { success: true, message: "Artículo guardado" }
  } catch (error) {
    console.error("Error guardando post:", error)
    return { success: false, message: "Error al guardar" }
  }
}

export const getSavedPosts = async () => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.savedPosts], "readonly")
    const store = transaction.objectStore(STORES.savedPosts)
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Error obteniendo posts guardados:", error)
    return []
  }
}

export const removePostFromIndexedDB = async (postId) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.savedPosts], "readwrite")
    const store = transaction.objectStore(STORES.savedPosts)
    await store.delete(postId)
    return { success: true, message: "Artículo eliminado" }
  } catch (error) {
    console.error("Error eliminando post:", error)
    return { success: false, message: "Error al eliminar" }
  }
}

export const isPostSaved = async (postId) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.savedPosts], "readonly")
    const store = transaction.objectStore(STORES.savedPosts)
    const request = store.get(postId)

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(!!request.result)
      request.onerror = () => resolve(false)
    })
  } catch (error) {
    return false
  }
}

export const getSavedPostBySlug = async (slug) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.savedPosts], "readonly")
    const store = transaction.objectStore(STORES.savedPosts)
    const request = store.getAll()

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const posts = request.result
        const post = posts.find((p) => p.slug === slug)
        resolve(post || null)
      }
      request.onerror = () => resolve(null)
    })
  } catch (error) {
    console.error("Error buscando post por slug:", error)
    return null
  }
}

// Historial de lectura
export const addToReadingHistory = async (postId, postTitle, postSlug) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.readingHistory], "readwrite")
    const store = transaction.objectStore(STORES.readingHistory)

    await store.put({
      postId,
      postTitle,
      postSlug,
      visitedAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error agregando al historial:", error)
    return { success: false }
  }
}

export const getReadingHistory = async (limit = 10) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.readingHistory], "readonly")
    const store = transaction.objectStore(STORES.readingHistory)
    const index = store.index("visitedAt")
    const request = index.openCursor(null, "prev")

    return new Promise((resolve) => {
      const results = []
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor && results.length < limit) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      request.onerror = () => resolve([])
    })
  } catch (error) {
    console.error("Error obteniendo historial:", error)
    return []
  }
}

// Preferencias
export const savePreference = async (key, value) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.preferences], "readwrite")
    const store = transaction.objectStore(STORES.preferences)
    await store.put({ key, value })
    return { success: true }
  } catch (error) {
    console.error("Error guardando preferencia:", error)
    return { success: false }
  }
}

export const getPreference = async (key, defaultValue = null) => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORES.preferences], "readonly")
    const store = transaction.objectStore(STORES.preferences)
    const request = store.get(key)

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : defaultValue)
      }
      request.onerror = () => resolve(defaultValue)
    })
  } catch (error) {
    return defaultValue
  }
}

export const isOnline = () => {
  return navigator.onLine
}
