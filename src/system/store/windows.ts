import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { WindowState, Bounds, Position, Size } from './types'

interface WindowStore {
  windows: Record<string, WindowState>
  focusedWindow: string | null
  nextZIndex: number
  
  // Actions
  openWindow: (window: Partial<Omit<WindowState, 'id' | 'zIndex' | 'focused'>> & { appId: string; title: string; bounds?: Bounds; workspace?: number; id?: string }) => string
  closeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  moveWindow: (windowId: string, position: Position) => void
  resizeWindow: (windowId: string, size: Size) => void
  updateWindowBounds: (windowId: string, bounds: Bounds) => void
  setWindowVisibility: (windowId: string, visible: boolean) => void
  moveWindowToWorkspace: (windowId: string, workspace: number) => void
  
  // Queries
  getWindow: (windowId: string) => WindowState | undefined
  getWindowsByApp: (appId: string) => WindowState[]
  getWindowsByWorkspace: (workspace: number) => WindowState[]
  getFocusedWindow: () => WindowState | undefined
  getVisibleWindows: () => WindowState[]
  getNextWindowInStack: (currentWindowId: string) => WindowState | undefined
  
  // Utilities
  generateWindowId: () => string
  bringToFront: (windowId: string) => void
  sendToBack: (windowId: string) => void
  cascadeWindows: () => void
  tileWindows: (layout: 'horizontal' | 'vertical' | 'grid') => void
}

const DEFAULT_WINDOW_SIZE: Size = { width: 800, height: 600 }
const DEFAULT_WINDOW_POSITION: Position = { x: 100, y: 100 }
const CASCADE_OFFSET = 30

export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector((set, get) => ({
    windows: {},
    focusedWindow: null,
    nextZIndex: 100,

    generateWindowId: () => {
      return `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    openWindow: (windowData) => {
      const state = get()
      const windowId = windowData.id || state.generateWindowId()
      
      // Check if app is singleton and already has a window
      if (windowData.appId) {
        const existingWindows = state.getWindowsByApp(windowData.appId)
        const appDefinition = existingWindows[0] // Assume app definition is available
        if (appDefinition && existingWindows.length > 0) {
          // Focus existing window instead of creating new one
          const existingWindow = existingWindows[0]
          state.focusWindow(existingWindow.id)
          return existingWindow.id
        }
      }

      // Calculate position with cascade
      const visibleWindows = state.getVisibleWindows()
      const cascadeIndex = visibleWindows.length
      const position = {
        x: DEFAULT_WINDOW_POSITION.x + (cascadeIndex * CASCADE_OFFSET),
        y: DEFAULT_WINDOW_POSITION.y + (cascadeIndex * CASCADE_OFFSET)
      }

      const newWindow: WindowState = {
        id: windowId,
        appId: windowData.appId,
        title: windowData.title,
        bounds: {
          ...position,
          width: windowData.bounds?.width || DEFAULT_WINDOW_SIZE.width,
          height: windowData.bounds?.height || DEFAULT_WINDOW_SIZE.height
        },
        minimized: false,
        maximized: false,
        focused: true,
        zIndex: state.nextZIndex,
        resizable: windowData.resizable ?? true,
        movable: windowData.movable ?? true,
        closable: windowData.closable ?? true,
        minimizable: windowData.minimizable ?? true,
        maximizable: windowData.maximizable ?? true,
        visible: windowData.visible ?? true,
        workspace: windowData.workspace || 1
      }

      set((state) => ({
        windows: { ...state.windows, [windowId]: newWindow },
        focusedWindow: windowId,
        nextZIndex: state.nextZIndex + 1
      }))

      return windowId
    },

    closeWindow: (windowId) => {
      set((state) => {
        const { [windowId]: removed, ...remainingWindows } = state.windows
        const newFocusedWindow = state.focusedWindow === windowId 
          ? Object.keys(remainingWindows)[0] || null 
          : state.focusedWindow

        return {
          windows: remainingWindows,
          focusedWindow: newFocusedWindow
        }
      })
    },

    focusWindow: (windowId) => {
      const state = get()
      const window = state.windows[windowId]
      if (!window) return

      set((state) => ({
        windows: {
          ...state.windows,
          [windowId]: {
            ...window,
            focused: true,
            minimized: false,
            zIndex: state.nextZIndex
          }
        },
        focusedWindow: windowId,
        nextZIndex: state.nextZIndex + 1
      }))

      // Unfocus other windows
      Object.keys(state.windows).forEach(id => {
        if (id !== windowId && state.windows[id].focused) {
          set((state) => ({
            windows: {
              ...state.windows,
              [id]: { ...state.windows[id], focused: false }
            }
          }))
        }
      })
    },

    minimizeWindow: (windowId) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        const newFocusedWindow = state.focusedWindow === windowId
          ? Object.keys(state.windows).find(id => 
              id !== windowId && !state.windows[id].minimized
            ) || null
          : state.focusedWindow

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, minimized: true, focused: false }
          },
          focusedWindow: newFocusedWindow
        }
      })
    },

    maximizeWindow: (windowId) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, maximized: !window.maximized }
          }
        }
      })
    },

    restoreWindow: (windowId) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, minimized: false, maximized: false }
          }
        }
      })
    },

    moveWindow: (windowId, position) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window || !window.movable) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: {
              ...window,
              bounds: { ...window.bounds, ...position }
            }
          }
        }
      })
    },

    resizeWindow: (windowId, size) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window || !window.resizable) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: {
              ...window,
              bounds: { ...window.bounds, ...size }
            }
          }
        }
      })
    },

    updateWindowBounds: (windowId, bounds) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, bounds }
          }
        }
      })
    },

    setWindowVisibility: (windowId, visible) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, visible }
          }
        }
      })
    },

    moveWindowToWorkspace: (windowId, workspace) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, workspace }
          }
        }
      })
    },

    // Queries
    getWindow: (windowId) => get().windows[windowId],

    getWindowsByApp: (appId) => {
      const { windows } = get()
      return Object.values(windows).filter(window => window.appId === appId)
    },

    getWindowsByWorkspace: (workspace) => {
      const { windows } = get()
      return Object.values(windows).filter(window => window.workspace === workspace)
    },

    getFocusedWindow: () => {
      const { focusedWindow, windows } = get()
      return focusedWindow ? windows[focusedWindow] : undefined
    },

    getVisibleWindows: () => {
      const { windows } = get()
      return Object.values(windows)
        .filter(window => window.visible && !window.minimized)
        .sort((a, b) => a.zIndex - b.zIndex)
    },

    getNextWindowInStack: (currentWindowId) => {
      const visibleWindows = get().getVisibleWindows()
      const currentIndex = visibleWindows.findIndex(w => w.id === currentWindowId)
      if (currentIndex === -1) return undefined
      
      const nextIndex = (currentIndex + 1) % visibleWindows.length
      return visibleWindows[nextIndex]
    },

    // Utilities
    bringToFront: (windowId) => {
      get().focusWindow(windowId)
    },

    sendToBack: (windowId) => {
      set((state) => {
        const window = state.windows[windowId]
        if (!window) return state

        return {
          windows: {
            ...state.windows,
            [windowId]: { ...window, zIndex: 1 }
          }
        }
      })
    },

    cascadeWindows: () => {
      const { windows } = get()
      const visibleWindows = Object.values(windows).filter(w => w.visible && !w.minimized)
      
      visibleWindows.forEach((window, index) => {
        const position = {
          x: DEFAULT_WINDOW_POSITION.x + (index * CASCADE_OFFSET),
          y: DEFAULT_WINDOW_POSITION.y + (index * CASCADE_OFFSET)
        }
        get().moveWindow(window.id, position)
      })
    },

    tileWindows: (layout) => {
      const { windows } = get()
      const visibleWindows = Object.values(windows).filter(w => w.visible && !w.minimized)
      
      if (visibleWindows.length === 0) return

      const screenWidth = window.innerWidth - 64 // Account for dock
      const screenHeight = window.innerHeight - 48 // Account for topbar

      switch (layout) {
        case 'horizontal': {
          const windowWidth = screenWidth / visibleWindows.length
          visibleWindows.forEach((window, index) => {
            get().updateWindowBounds(window.id, {
              x: 64 + (index * windowWidth),
              y: 48,
              width: windowWidth,
              height: screenHeight
            })
          })
          break
        }
        case 'vertical': {
          const windowHeight = screenHeight / visibleWindows.length
          visibleWindows.forEach((window, index) => {
            get().updateWindowBounds(window.id, {
              x: 64,
              y: 48 + (index * windowHeight),
              width: screenWidth,
              height: windowHeight
            })
          })
          break
        }
        case 'grid': {
          const cols = Math.ceil(Math.sqrt(visibleWindows.length))
          const rows = Math.ceil(visibleWindows.length / cols)
          const windowWidth = screenWidth / cols
          const windowHeight = screenHeight / rows

          visibleWindows.forEach((window, index) => {
            const col = index % cols
            const row = Math.floor(index / cols)
            get().updateWindowBounds(window.id, {
              x: 64 + (col * windowWidth),
              y: 48 + (row * windowHeight),
              width: windowWidth,
              height: windowHeight
            })
          })
          break
        }
      }
    }
  }))
)
