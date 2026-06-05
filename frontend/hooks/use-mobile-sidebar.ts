'use client'

import { useCallback, useEffect, useState } from 'react'

const DESKTOP_MEDIA = '(min-width: 1024px)'

export function useMobileSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA)
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (sidebarOpen && !isDesktop) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, isDesktop])

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])

  const closeSidebarOnMobile = useCallback(() => {
    if (!isDesktop) setSidebarOpen(false)
  }, [isDesktop])

  return {
    sidebarOpen,
    isDesktop,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    closeSidebarOnMobile,
  }
}
