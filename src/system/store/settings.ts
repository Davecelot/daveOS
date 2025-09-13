import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SystemSettings, ThemeSettings, DockSettings } from './types'

interface SettingsStore {
  settings: SystemSettings
  
  // Theme actions
  setThemeMode: (mode: ThemeSettings['mode']) => void
  setAccentColor: (color: string) => void
  setFontSize: (size: ThemeSettings['fontSize']) => void
  setReducedMotion: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  
  // Dock actions
  setDockPosition: (position: DockSettings['position']) => void
  setDockSize: (size: DockSettings['size']) => void
  setDockAutoHide: (autoHide: boolean) => void
  setPinnedApps: (apps: string[]) => void
  addPinnedApp: (appId: string) => void
  removePinnedApp: (appId: string) => void
  
  // System actions
  setLanguage: (language: string) => void
  setTimezone: (timezone: string) => void
  setUse24HourFormat: (use24Hour: boolean) => void
  setWallpaper: (wallpaper: string) => void
  setShortcut: (action: string, shortcut: string) => void
  
  // Utilities
  resetToDefaults: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const DEFAULT_SETTINGS: SystemSettings = {
  theme: {
    mode: 'light',
    accentColor: '#E95420',
    fontSize: 'normal',
    reducedMotion: false,
    highContrast: false
  },
  dock: {
    position: 'left',
    size: 'normal',
    autoHide: false,
    pinnedApps: ['files', 'terminal', 'textedit', 'calculator', 'settings']
  },
  language: 'es',
  timezone: 'America/Argentina/Buenos_Aires',
  use24HourFormat: true,
  wallpaper: '/wallpapers/ubuntu-default.jpg',
  shortcuts: {
    'overview': 'Super',
    'terminal': 'Ctrl+Alt+T',
    'files': 'Super+E',
    'screenshot': 'PrtSc',
    'lock': 'Super+L',
    'workspace-left': 'Ctrl+Alt+Left',
    'workspace-right': 'Ctrl+Alt+Right',
    'window-close': 'Alt+F4',
    'window-minimize': 'Super+H',
    'window-maximize': 'Super+Up',
    'alt-tab': 'Alt+Tab',
    'alt-grave': 'Alt+`'
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      // Theme actions
      setThemeMode: (mode) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, mode }
          }
        }))
        
        // Apply theme to document
        const root = document.documentElement
        if (mode === 'dark') {
          root.classList.add('dark')
        } else if (mode === 'light') {
          root.classList.remove('dark')
        } else {
          // Auto mode - check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.toggle('dark', prefersDark)
        }
      },

      setAccentColor: (color) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, accentColor: color }
          }
        }))
        
        // Apply accent color to CSS variables
        document.documentElement.style.setProperty('--accent', color)
      },

      setFontSize: (size) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, fontSize: size }
          }
        }))
        
        // Apply font size class to body
        const body = document.body
        body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xl')
        body.classList.add(`font-size-${size}`)
      },

      setReducedMotion: (enabled) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, reducedMotion: enabled }
          }
        }))
        
        // Apply reduced motion preference
        document.documentElement.style.setProperty(
          '--animation-duration',
          enabled ? '0.01ms' : '0.3s'
        )
      },

      setHighContrast: (enabled) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, highContrast: enabled }
          }
        }))
        
        // Apply high contrast class
        document.documentElement.classList.toggle('high-contrast', enabled)
      },

      // Dock actions
      setDockPosition: (position) => {
        set((state) => ({
          settings: {
            ...state.settings,
            dock: { ...state.settings.dock, position }
          }
        }))
      },

      setDockSize: (size) => {
        set((state) => ({
          settings: {
            ...state.settings,
            dock: { ...state.settings.dock, size }
          }
        }))
      },

      setDockAutoHide: (autoHide) => {
        set((state) => ({
          settings: {
            ...state.settings,
            dock: { ...state.settings.dock, autoHide }
          }
        }))
      },

      setPinnedApps: (apps) => {
        set((state) => ({
          settings: {
            ...state.settings,
            dock: { ...state.settings.dock, pinnedApps: apps }
          }
        }))
      },

      addPinnedApp: (appId) => {
        const { settings } = get()
        if (!settings.dock.pinnedApps.includes(appId)) {
          set((state) => ({
            settings: {
              ...state.settings,
              dock: {
                ...state.settings.dock,
                pinnedApps: [...state.settings.dock.pinnedApps, appId]
              }
            }
          }))
        }
      },

      removePinnedApp: (appId) => {
        set((state) => ({
          settings: {
            ...state.settings,
            dock: {
              ...state.settings.dock,
              pinnedApps: state.settings.dock.pinnedApps.filter(id => id !== appId)
            }
          }
        }))
      },

      // System actions
      setLanguage: (language) => {
        set((state) => ({
          settings: { ...state.settings, language }
        }))
        
        // Update document language
        document.documentElement.lang = language
      },

      setTimezone: (timezone) => {
        set((state) => ({
          settings: { ...state.settings, timezone }
        }))
      },

      setUse24HourFormat: (use24Hour) => {
        set((state) => ({
          settings: { ...state.settings, use24HourFormat: use24Hour }
        }))
      },

      setWallpaper: (wallpaper) => {
        set((state) => ({
          settings: { ...state.settings, wallpaper }
        }))
        
        // Apply wallpaper to desktop
        const desktop = document.querySelector('.desktop')
        if (desktop) {
          (desktop as HTMLElement).style.backgroundImage = `url(${wallpaper})`
        }
      },

      setShortcut: (action, shortcut) => {
        set((state) => ({
          settings: {
            ...state.settings,
            shortcuts: { ...state.settings.shortcuts, [action]: shortcut }
          }
        }))
      },

      // Utilities
      resetToDefaults: () => {
        set({ settings: DEFAULT_SETTINGS })
        
        // Reset DOM classes and styles
        const root = document.documentElement
        const body = document.body
        
        root.className = ''
        body.className = 'font-ubuntu overflow-hidden font-size-normal'
        root.style.removeProperty('--accent')
        root.style.removeProperty('--animation-duration')
        document.documentElement.lang = DEFAULT_SETTINGS.language
      },

      exportSettings: () => {
        const { settings } = get()
        return JSON.stringify(settings, null, 2)
      },

      importSettings: (settingsJson) => {
        try {
          const importedSettings = JSON.parse(settingsJson) as SystemSettings
          
          // Validate settings structure
          if (!importedSettings.theme || !importedSettings.dock) {
            return false
          }
          
          set({ settings: importedSettings })
          
          // Apply imported settings to DOM
          const { setThemeMode, setAccentColor, setFontSize, setReducedMotion, setHighContrast, setWallpaper, setLanguage } = get()
          setThemeMode(importedSettings.theme.mode)
          setAccentColor(importedSettings.theme.accentColor)
          setFontSize(importedSettings.theme.fontSize)
          setReducedMotion(importedSettings.theme.reducedMotion)
          setHighContrast(importedSettings.theme.highContrast)
          setWallpaper(importedSettings.wallpaper)
          setLanguage(importedSettings.language)
          
          return true
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      }
    }),
    {
      name: 'daveos-settings',
      version: 1
    }
  )
)

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  const store = useSettingsStore.getState()
  const { setThemeMode, setAccentColor, setFontSize, setReducedMotion, setHighContrast, setWallpaper, setLanguage } = store
  
  // Apply initial settings
  setThemeMode(store.settings.theme.mode)
  setAccentColor(store.settings.theme.accentColor)
  setFontSize(store.settings.theme.fontSize)
  setReducedMotion(store.settings.theme.reducedMotion)
  setHighContrast(store.settings.theme.highContrast)
  setWallpaper(store.settings.wallpaper)
  setLanguage(store.settings.language)
  
  // Listen for system theme changes in auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    const currentSettings = useSettingsStore.getState().settings
    if (currentSettings.theme.mode === 'auto') {
      document.documentElement.classList.toggle('dark', e.matches)
    }
  })
}
