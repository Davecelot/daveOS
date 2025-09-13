import React, { useState } from 'react'
import { 
  FolderOpen, 
  Terminal, 
  FileText, 
  Calculator, 
  Settings, 
  Image, 
  Music, 
  Video, 
  Calendar, 
  StickyNote, 
  Gamepad2,
  Activity
} from 'lucide-react';
import { useWindowStore } from '../store/windows'
import { useSettingsStore } from '../store/settings'

const APP_ICONS = {
  files: FolderOpen,
  terminal: Terminal,
  textedit: FileText,
  calculator: Calculator,
  settings: Settings,
  imageviewer: Image,
  music: Music,
  videoplayer: Video,
  calendar: Calendar,
  notes: StickyNote,
  minesweeper: Gamepad2,
  systemmonitor: Activity
}

const APP_NAMES = {
  files: 'Files',
  terminal: 'Terminal',
  textedit: 'Text Editor',
  calculator: 'Calculator',
  settings: 'Settings',
  imageviewer: 'Image Viewer',
  music: 'Music',
  videoplayer: 'Video Player',
  calendar: 'Calendar',
  notes: 'Notes',
  minesweeper: 'Minesweeper',
  systemmonitor: 'System Monitor'
}

export function Dock() {
  const { settings } = useSettingsStore()
  const { openWindow, getWindowsByApp, focusWindow, minimizeWindow } = useWindowStore()
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)

  const handleAppClick = (appId: string, event: React.MouseEvent) => {
    const existingWindows = getWindowsByApp(appId)
    
    if (event.button === 1) {
      // Middle click - always open new window
      openNewWindow(appId)
    } else if (existingWindows.length === 0) {
      // No existing windows - open new one
      openNewWindow(appId)
    } else if (existingWindows.length === 1) {
      const window = existingWindows[0]
      if (window.minimized || !window.focused) {
        // Restore and focus window
        focusWindow(window.id)
      } else {
        // Minimize window
        minimizeWindow(window.id)
      }
    } else {
      // Multiple windows - focus next unfocused window or open new one
      const unfocusedWindow = existingWindows.find(w => !w.focused && !w.minimized)
      if (unfocusedWindow) {
        focusWindow(unfocusedWindow.id)
      } else {
        openNewWindow(appId)
      }
    }
  }

  const openNewWindow = (appId: string) => {
    openWindow({
      appId,
      title: APP_NAMES[appId as keyof typeof APP_NAMES] || appId,
      bounds: { x: 100, y: 100, width: 800, height: 600 },
      workspace: 1,
      minimized: false,
      maximized: false,
      resizable: true,
      movable: true,
      closable: true,
      minimizable: true,
      maximizable: true,
      visible: true
    })
  }

  const handleContextMenu = (_appId: string, event: React.MouseEvent) => {
    event.preventDefault()
    // TODO: Show context menu with options like "New Window", "Unpin", etc.
  }

  const isAppRunning = (appId: string) => {
    const windows = getWindowsByApp(appId)
    return windows.some(w => !w.minimized && w.visible)
  }

  return (
    <div className="fixed left-0 top-9 bottom-0 w-16 bg-black bg-opacity-40 backdrop-blur-md flex flex-col items-center py-4 space-y-3 z-40">
      <div className="flex flex-col items-center space-y-3">
        {settings.dock.pinnedApps.map((appId) => {
          const IconComponent = APP_ICONS[appId as keyof typeof APP_ICONS]
          const isRunning = isAppRunning(appId)
          const isHovered = hoveredApp === appId

          return (
            <div key={appId} className="relative">
              <button
                className={`w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:bg-opacity-20 transition-all duration-300 transform ${isHovered ? 'scale-110' : 'scale-100'} ${isRunning ? 'bg-white bg-opacity-10' : ''}`}
                onClick={(e) => handleAppClick(appId, e)}
                onContextMenu={(e) => handleContextMenu(appId, e)}
                onMouseEnter={() => setHoveredApp(appId)}
                onMouseLeave={() => setHoveredApp(null)}
                title={APP_NAMES[appId as keyof typeof APP_NAMES]}
              >
                {IconComponent && (
                  <IconComponent 
                    size={32} 
                    className={`transition-colors duration-200 ${isRunning ? 'text-white' : 'text-white opacity-80'}`}
                  />
                )}
              </button>

              {/* Ubuntu-style running indicator - orange pill */}
              {isRunning && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-full"></div>
              )}

              {/* Ubuntu-style tooltip */}
              {isHovered && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-95 text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap shadow-xl backdrop-blur-sm z-50 border border-white border-opacity-10">
                  {APP_NAMES[appId as keyof typeof APP_NAMES]}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 border-r-opacity-95"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dock separator */}
      <div className="w-8 h-px bg-white bg-opacity-20 my-4" />

      {/* Trash */}
      <div className="relative">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:bg-opacity-20 transition-all duration-300 transform hover:scale-110"
          onClick={() => {/* TODO: Open trash */}}
          onMouseEnter={() => setHoveredApp('trash')}
          onMouseLeave={() => setHoveredApp(null)}
          title="Trash"
        >
          <FolderOpen size={32} className="text-white opacity-80" />
        </button>

        {/* Ubuntu-style tooltip for trash */}
        {hoveredApp === 'trash' && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-95 text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap shadow-xl backdrop-blur-sm z-50 border border-white border-opacity-10">
            Trash
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 border-r-opacity-95"></div>
          </div>
        )}
      </div>
    </div>
  )
}
