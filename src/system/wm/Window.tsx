import React, { useRef, useEffect } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useWindowStore } from '../store/windows';
import { useSessionStore } from '../store/session';
import { useDragResize } from './useDragResize';
import { FileManager } from '../apps/FileManager';
import { TextEdit } from '../apps/TextEdit';
import { Calculator } from '../apps/Calculator';
import { Notes } from '../apps/Notes';
import { ImageViewer } from '../apps/ImageViewer';
import { Settings } from '../apps/Settings';
import { Calendar } from '../apps/Calendar';
import { SystemMonitor } from '../apps/SystemMonitor';
import { SimpleTerminal } from '../apps/SimpleTerminal';
import type { WindowState } from '../store/types';

interface WindowProps {
  window: WindowState
  children: React.ReactNode
}

export function Window({ window, children }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    updateWindowBounds
  } = useWindowStore()
  
  // Window snapping functionality - simplified for now
  const snapToHalf = (side: 'left' | 'right') => ({
    x: side === 'left' ? 0 : globalThis.innerWidth / 2,
    y: 0,
    width: globalThis.innerWidth / 2,
    height: globalThis.innerHeight
  })
  
  const snapToMaximize = () => ({
    x: 0,
    y: 0,
    width: globalThis.innerWidth,
    height: globalThis.innerHeight
  })

  const {
    elementRef: _elementRef,
    isDragging,
    isResizing: _isResizing,
    handleMouseDown,
    resizeHandles
  } = useDragResize({
    bounds: window.bounds,
    onMove: (position) => moveWindow(window.id, position),
    onResize: (size) => resizeWindow(window.id, size),
    onBoundsChange: (bounds) => updateWindowBounds(window.id, bounds),
    disabled: window.maximized,
    resizable: window.resizable,
    movable: window.movable,
    minSize: { width: 300, height: 200 }
  })

  // Handle window focus
  const handleWindowClick = () => {
    if (!window.focused) {
      focusWindow(window.id)
    }
  }

  // Handle double-click on titlebar to maximize/restore
  const handleTitlebarDoubleClick = () => {
    if (window.maximizable) {
      if (window.maximized) {
        restoreWindow(window.id)
      } else {
        maximizeWindow(window.id)
      }
    }
  }

  // Handle drag to edges for snapping
  useEffect(() => {
    if (!isDragging) return

    const handleDragEnd = () => {
      const rect = windowRef.current?.getBoundingClientRect()
      if (!rect) return

      const screenWidth = globalThis.innerWidth
      const threshold = 20

      // Snap to maximize if dragged to top
      if (rect.y <= threshold) {
        const maxBounds = snapToMaximize()
        updateWindowBounds(window.id, maxBounds)
        maximizeWindow(window.id)
        return
      }

      // Snap to left half
      if (rect.x <= threshold) {
        const leftBounds = snapToHalf('left')
        updateWindowBounds(window.id, leftBounds)
        return
      }

      // Snap to right half
      if (rect.x + rect.width >= screenWidth - threshold) {
        const rightBounds = snapToHalf('right')
        updateWindowBounds(window.id, rightBounds)
        return
      }
    }

    document.addEventListener('mouseup', handleDragEnd)
    return () => document.removeEventListener('mouseup', handleDragEnd)
  }, [isDragging, window.id, snapToHalf, snapToMaximize, updateWindowBounds, maximizeWindow])

  // Apply window state styles
  const windowStyle: React.CSSProperties = {
    position: 'fixed',
    left: window.maximized ? 64 : window.bounds.x,
    top: window.maximized ? 48 : window.bounds.y,
    width: window.maximized ? 'calc(100vw - 64px)' : window.bounds.width,
    height: window.maximized ? 'calc(100vh - 48px)' : window.bounds.height,
    zIndex: window.zIndex,
    display: window.visible ? 'flex' : 'none',
    flexDirection: 'column',
    transition: window.maximized ? 'all 0.2s ease-out' : 'none',
    transform: window.minimized ? 'scale(0.1) translateY(100vh)' : 'none',
    opacity: window.minimized ? 0 : 1
  }

  if (!window.visible) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={`fixed bg-surface overflow-hidden font-ubuntu ${window.focused ? '' : 'opacity-95'} ${window.maximized ? 'rounded-none' : 'rounded-xl'}`}
      style={{
        ...windowStyle,
        boxShadow: window.maximized ? 'none' : 'var(--shadow)',
        border: window.focused ? '1px solid rgba(233, 84, 32, 0.3)' : '1px solid var(--surface-border)'
      }}
      onMouseDown={handleWindowClick}
    >
      {/* GNOME HeaderBar */}
      <div
        className={`bg-surface border-b border-surface-border px-4 py-3 flex items-center justify-between cursor-move select-none ${window.maximized ? 'rounded-none' : 'rounded-t-xl'}`}
        onMouseDown={window.movable ? handleMouseDown : undefined}
        onDoubleClick={handleTitlebarDoubleClick}
        style={{
          background: window.focused 
            ? 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)'
            : 'var(--surface-2)'
        }}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="font-medium text-foreground truncate">{window.title}</span>
        </div>
        
        {/* Ubuntu GNOME style window controls (right side) */}
        <div className="flex items-center space-x-2">
          {/* Minimize Button */}
          {window.minimizable && (
            <button
              className="w-7 h-7 rounded-full hover:bg-yellow-500 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 group"
              onClick={(e) => {
                e.stopPropagation()
                minimizeWindow(window.id)
              }}
              title="Minimize"
            >
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80 group-hover:opacity-100 flex items-center justify-center">
                <Minus size={8} className="text-yellow-900 opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          )}
          
          {/* Maximize/Restore Button */}
          {window.maximizable && (
            <button
              className="w-7 h-7 rounded-full hover:bg-green-500 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 group"
              onClick={(e) => {
                e.stopPropagation()
                if (window.maximized) {
                  restoreWindow(window.id)
                } else {
                  maximizeWindow(window.id)
                }
              }}
              title={window.maximized ? "Restore" : "Maximize"}
            >
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-80 group-hover:opacity-100 flex items-center justify-center">
                {window.maximized ? 
                  <Square size={6} className="text-green-900 opacity-0 group-hover:opacity-100" /> : 
                  <Maximize2 size={6} className="text-green-900 opacity-0 group-hover:opacity-100" />
                }
              </div>
            </button>
          )}
          
          {/* Close Button */}
          {window.closable && (
            <button
              className="w-7 h-7 rounded-full hover:bg-red-500 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 group"
              onClick={(e) => {
                e.stopPropagation()
                closeWindow(window.id)
              }}
              title="Close"
            >
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-80 group-hover:opacity-100 flex items-center justify-center">
                <X size={8} className="text-red-900 opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-surface">
        {children}
      </div>

      {/* Resize Handles */}
      {window.resizable && !window.maximized && resizeHandles.map(({ handle, onMouseDown, className, style }) => (
        <div
          key={handle}
          className={className}
          style={style}
          onMouseDown={onMouseDown}
        />
      ))}
    </div>
  )
}

// Window Manager Component
export function WindowManager() {
  const { windows } = useWindowStore()
  const { currentWorkspace } = useSessionStore()

  // Get windows for current workspace, sorted by z-index
  const workspaceWindows = Object.values(windows)
    .filter(window => window.workspace === currentWorkspace)
    .sort((a, b) => a.zIndex - b.zIndex)

  return (
    <>
      {workspaceWindows.map(window => (
        <Window key={window.id} window={window}>
          <WindowContent windowId={window.id} appId={window.appId} />
        </Window>
      ))}
    </>
  )
}
function WindowContent({ windowId, appId }: { windowId: string; appId: string }) {

  const apps: Record<string, React.ComponentType<any>> = {
    terminal: SimpleTerminal,
    textedit: TextEdit,
    files: FileManager,
    settings: Settings,
    calculator: Calculator,
    notes: Notes,
    imageviewer: ImageViewer,
    calendar: Calendar,
    systemmonitor: SystemMonitor
  }

  const AppComponent = apps[appId]
  
  if (!AppComponent) {
    return (
      <div className="flex items-center justify-center h-full text-foreground-muted">
        <div className="text-center">
          <p className="text-lg font-medium">App not found</p>
          <p className="text-sm">The app "{appId}" could not be loaded.</p>
        </div>
      </div>
    )
  }

  return <AppComponent windowId={windowId} />
}
