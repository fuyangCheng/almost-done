import { useState, useEffect } from 'react'

/**
 * Captures the `beforeinstallprompt` event so we can trigger it
 * from a custom UI button instead of the browser's default banner.
 *
 * Returns:
 *   canInstall  – true when the prompt is available (not yet installed)
 *   install()   – call this to show the native install dialog
 *   isInstalled – true once the user accepted
 */
export function usePWAInstall() {
  const [prompt,      setPrompt]      = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    /* Already running as installed PWA */
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    function onBeforeInstall(e) {
      e.preventDefault()          // stop the auto-banner
      setPrompt(e)                // save the event for later
    }

    function onAppInstalled() {
      setIsInstalled(true)
      setPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled',        onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled',        onAppInstalled)
    }
  }, [])

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setPrompt(null)
    }
  }

  return { canInstall: !!prompt && !isInstalled, install, isInstalled }
}
