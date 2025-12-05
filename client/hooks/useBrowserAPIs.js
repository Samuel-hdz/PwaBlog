"use client"

import { useState, useEffect } from "react"
import {
  vibrate,
  VIBRATION_PATTERNS,
  copyToClipboard,
  requestNotificationPermission,
  showNotification,
  savePostToIndexedDB,
  getSavedPosts,
  removePostFromIndexedDB,
  isPostSaved,
  addToReadingHistory,
  getReadingHistory,
  savePreference,
  getPreference,
  getSavedPostBySlug,
  isOnline,
} from "../utils/browserAPIs"

export { getSavedPostBySlug, isOnline }

// Hook para Vibration API
export const useVibration = () => {
  const vibrateDevice = (pattern = VIBRATION_PATTERNS.short) => {
    vibrate(pattern)
  }

  return { vibrate: vibrateDevice, patterns: VIBRATION_PATTERNS }
}

// Hook para Clipboard API
export const useClipboard = () => {
  const [copied, setCopied] = useState(false)

  const copy = async (text) => {
    const result = await copyToClipboard(text)
    if (result.success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    return result
  }

  return { copy, copied }
}

// Hook para Notification API
export const useNotifications = () => {
  const [permission, setPermission] = useState("Notification" in window ? Notification.permission : "denied")

  const requestPermission = async () => {
    const result = await requestNotificationPermission()
    setPermission(result.permission)
    return result
  }

  const notify = (title, options) => {
    return showNotification(title, options)
  }

  return { permission, requestPermission, notify }
}

// Hook para IndexedDB - Posts guardados
export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSavedPosts = async () => {
    setLoading(true)
    const posts = await getSavedPosts()
    setSavedPosts(posts)
    setLoading(false)
  }

  useEffect(() => {
    loadSavedPosts()
  }, [])

  const savePost = async (post) => {
    const result = await savePostToIndexedDB(post)
    if (result.success) {
      await loadSavedPosts()
    }
    return result
  }

  const removePost = async (postId) => {
    const result = await removePostFromIndexedDB(postId)
    if (result.success) {
      await loadSavedPosts()
    }
    return result
  }

  const checkIfSaved = async (postId) => {
    return await isPostSaved(postId)
  }

  return { savedPosts, loading, savePost, removePost, checkIfSaved, refresh: loadSavedPosts }
}

// Hook para historial de lectura
export const useReadingHistory = () => {
  const [history, setHistory] = useState([])

  const loadHistory = async (limit = 10) => {
    const hist = await getReadingHistory(limit)
    setHistory(hist)
  }

  const addToHistory = async (postId, postTitle, postSlug) => {
    await addToReadingHistory(postId, postTitle, postSlug)
    await loadHistory()
  }

  useEffect(() => {
    loadHistory()
  }, [])

  return { history, addToHistory, refresh: loadHistory }
}

// Hook para preferencias
export const usePreferences = () => {
  const [preferences, setPreferences] = useState({})

  const setPreference = async (key, value) => {
    await savePreference(key, value)
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const getPreferenceValue = async (key, defaultValue) => {
    const value = await getPreference(key, defaultValue)
    setPreferences((prev) => ({ ...prev, [key]: value }))
    return value
  }

  return { preferences, setPreference, getPreference: getPreferenceValue }
}
