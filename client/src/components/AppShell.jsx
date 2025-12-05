"use client"

import { useEffect, useState } from "react"
import OfflineIndicator from "./OfflineIndicator"

export default function AppShell({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    console.log("[v0] AppShell component mounted")
  }, [])

  useEffect(() => {
    // Detectar cambios en la conexión
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <>
      {/* Indicador de estado offline */}
      {showOfflineMessage && <OfflineIndicator />}

      {children}
    </>
  )
}
