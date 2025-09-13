import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionData, Workspace } from './types'
import { useWindowStore } from './windows'
import { useSettingsStore } from './settings'

interface SessionStore {
  workspaces: Workspace[]
  currentWorkspace: number
  isOverviewOpen: boolean
  
  // Workspace actions
  createWorkspace: (name?: string) => number
  deleteWorkspace: (workspaceId: number) => void
  switchToWorkspace: (workspaceId: number) => void
  renameWorkspace: (workspaceId: number, name: string) => void
  moveWindowToWorkspace: (windowId: string, workspaceId: number) => void
  
  // Overview actions
  openOverview: () => void
  closeOverview: () => void
  toggleOverview: () => void
  
  // Session management
  saveSession: () => void
  restoreSession: (sessionData: SessionData) => void
  clearSession: () => void
  getSessionData: () => SessionData
  
  // Utilities
  getActiveWorkspace: () => Workspace | undefined
  getWorkspaceWindows: (workspaceId: number) => string[]
  canDeleteWorkspace: (workspaceId: number) => boolean
}

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: 1, name: 'Workspace 1', windows: [], active: true },
  { id: 2, name: 'Workspace 2', windows: [], active: false }
]

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      workspaces: DEFAULT_WORKSPACES,
      currentWorkspace: 1,
      isOverviewOpen: false,

      // Workspace actions
      createWorkspace: (name) => {
        const { workspaces } = get()
        const newId = Math.max(...workspaces.map(w => w.id)) + 1
        const newWorkspace: Workspace = {
          id: newId,
          name: name || `Workspace ${newId}`,
          windows: [],
          active: false
        }

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace]
        }))

        return newId
      },

      deleteWorkspace: (workspaceId) => {
        const { workspaces, currentWorkspace, canDeleteWorkspace } = get()
        
        if (!canDeleteWorkspace(workspaceId)) return

        const workspaceToDelete = workspaces.find(w => w.id === workspaceId)
        if (!workspaceToDelete) return

        // Move windows to first available workspace
        const targetWorkspace = workspaces.find(w => w.id !== workspaceId)
        if (targetWorkspace && workspaceToDelete.windows.length > 0) {
          const windowStore = useWindowStore.getState()
          workspaceToDelete.windows.forEach(windowId => {
            windowStore.moveWindowToWorkspace(windowId, targetWorkspace.id)
          })
          
          set((state) => ({
            workspaces: state.workspaces.map(w => 
              w.id === targetWorkspace.id 
                ? { ...w, windows: [...w.windows, ...workspaceToDelete.windows] }
                : w
            )
          }))
        }

        // Remove workspace
        set((state) => ({
          workspaces: state.workspaces.filter(w => w.id !== workspaceId),
          currentWorkspace: currentWorkspace === workspaceId 
            ? (targetWorkspace?.id || 1) 
            : currentWorkspace
        }))
      },

      switchToWorkspace: (workspaceId) => {
        const { workspaces } = get()
        const workspace = workspaces.find(w => w.id === workspaceId)
        if (!workspace) return

        set((state) => ({
          currentWorkspace: workspaceId,
          workspaces: state.workspaces.map(w => ({
            ...w,
            active: w.id === workspaceId
          }))
        }))

        // Update window visibility based on workspace
        const windowStore = useWindowStore.getState()
        Object.values(windowStore.windows).forEach(window => {
          windowStore.setWindowVisibility(
            window.id, 
            window.workspace === workspaceId
          )
        })
      },

      renameWorkspace: (workspaceId, name) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => 
            w.id === workspaceId ? { ...w, name } : w
          )
        }))
      },

      moveWindowToWorkspace: (windowId, workspaceId) => {
        const windowStore = useWindowStore.getState()
        const window = windowStore.getWindow(windowId)
        if (!window) return

        const oldWorkspaceId = window.workspace

        // Update window workspace
        windowStore.moveWindowToWorkspace(windowId, workspaceId)

        // Update workspace window lists
        set((state) => ({
          workspaces: state.workspaces.map(w => {
            if (w.id === oldWorkspaceId) {
              return { ...w, windows: w.windows.filter(id => id !== windowId) }
            } else if (w.id === workspaceId) {
              return { ...w, windows: [...w.windows, windowId] }
            }
            return w
          })
        }))

        // Update window visibility
        windowStore.setWindowVisibility(windowId, workspaceId === get().currentWorkspace)
      },

      // Overview actions
      openOverview: () => {
        set({ isOverviewOpen: true })
      },

      closeOverview: () => {
        set({ isOverviewOpen: false })
      },

      toggleOverview: () => {
        set((state) => ({ isOverviewOpen: !state.isOverviewOpen }))
      },

      // Session management
      saveSession: () => {
        const { workspaces, currentWorkspace } = get()
        const windowStore = useWindowStore.getState()
        const settingsStore = useSettingsStore.getState()

        const sessionData: SessionData = {
          windows: Object.values(windowStore.windows),
          workspaces,
          currentWorkspace,
          settings: settingsStore.settings,
          timestamp: new Date()
        }

        localStorage.setItem('daveos-session', JSON.stringify(sessionData))
      },

      restoreSession: (sessionData) => {
        const { windows, workspaces, currentWorkspace, settings } = sessionData

        // Restore settings
        const settingsStore = useSettingsStore.getState()
        settingsStore.importSettings(JSON.stringify(settings))

        // Restore workspaces
        set({
          workspaces: workspaces.map(w => ({
            ...w,
            active: w.id === currentWorkspace
          })),
          currentWorkspace
        })

        // Restore windows
        const windowStore = useWindowStore.getState()
        windows.forEach(window => {
          windowStore.openWindow({
            ...window,
            id: window.id,
            visible: window.workspace === currentWorkspace
          })
        })
      },

      clearSession: () => {
        localStorage.removeItem('daveos-session')
        
        // Reset to default state
        set({
          workspaces: DEFAULT_WORKSPACES,
          currentWorkspace: 1,
          isOverviewOpen: false
        })

        // Clear all windows
        const windowStore = useWindowStore.getState()
        Object.keys(windowStore.windows).forEach(windowId => {
          windowStore.closeWindow(windowId)
        })
      },

      getSessionData: () => {
        const { workspaces, currentWorkspace } = get()
        const windowStore = useWindowStore.getState()
        const settingsStore = useSettingsStore.getState()

        return {
          windows: Object.values(windowStore.windows),
          workspaces,
          currentWorkspace,
          settings: settingsStore.settings,
          timestamp: new Date()
        }
      },

      // Utilities
      getActiveWorkspace: () => {
        const { workspaces, currentWorkspace } = get()
        return workspaces.find(w => w.id === currentWorkspace)
      },

      getWorkspaceWindows: (workspaceId) => {
        const { workspaces } = get()
        const workspace = workspaces.find(w => w.id === workspaceId)
        return workspace?.windows || []
      },

      canDeleteWorkspace: (_workspaceId: number) => {
        const { workspaces } = get()
        return workspaces.length > 1 // Always keep at least one workspace
      }
    }),
    {
      name: 'daveos-session',
      version: 1,
      partialize: (state) => ({
        workspaces: state.workspaces,
        currentWorkspace: state.currentWorkspace
      })
    }
  )
)

// Auto-save session periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    useSessionStore.getState().saveSession()
  }, 30000) // Save every 30 seconds

  // Save session on page unload
  window.addEventListener('beforeunload', () => {
    useSessionStore.getState().saveSession()
  })

  // Restore session on page load
  const savedSession = localStorage.getItem('daveos-session')
  if (savedSession) {
    try {
      const sessionData = JSON.parse(savedSession) as SessionData
      // Only restore if session is less than 24 hours old
      const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime()
      if (sessionAge < 24 * 60 * 60 * 1000) {
        useSessionStore.getState().restoreSession(sessionData)
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
    }
  }
}
