import React, { useRef, useEffect } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useWindowStore } from '../store/windows';
import { useSessionStore } from '../store/session';
import { useDragResize } from './useDragResize';
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
    elementRef,
    isDragging,
    isResizing,
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
      const screenHeight = globalThis.innerHeight
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
      ref={(el) => {
        windowRef.current = el
        if (elementRef) {
          elementRef.current = el
        }
        if (el) {
          el.style.zIndex = String(1000 + (window.zIndex || 0))
        }
      }}
      className={`window ${window.focused ? 'ring-2 ring-accent' : ''} ${
        isDragging || isResizing ? 'select-none' : ''
      }`}
      style={windowStyle}
      onClick={handleWindowClick}
    >
      {/* Window Titlebar */}
      <div
        className="window-titlebar cursor-move"
        onMouseDown={window.movable ? handleMouseDown : undefined}
        onDoubleClick={handleTitlebarDoubleClick}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="font-medium text-sm truncate">{window.title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Minimize Button */}
          {window.minimizable && (
            <button
              className="w-6 h-6 rounded-ubuntu-sm hover:bg-surface-hover flex items-center justify-center transition-smooth"
              onClick={(e) => {
                e.stopPropagation()
                minimizeWindow(window.id)
              }}
              title="Minimize"
            >
              <Minus size={14} />
            </button>
          )}
          
          {/* Maximize/Restore Button */}
          {window.maximizable && (
            <button
              className="w-6 h-6 rounded-ubuntu-sm hover:bg-surface-hover flex items-center justify-center transition-smooth"
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
              {window.maximized ? <Square size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
          
          {/* Close Button */}
          {window.closable && (
            <button
              className="w-6 h-6 rounded-ubuntu-sm hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-smooth"
              onClick={(e) => {
                e.stopPropagation()
                closeWindow(window.id)
              }}
              title="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content flex-1 overflow-hidden">
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
  // Placeholder app components
  const TextEditor = () => (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Text Editor</h2>
      <textarea 
        className="w-full h-64 p-2 border rounded resize-none"
        placeholder="Start typing..."
      />
    </div>
  );

  const FileManager = () => (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">File Manager</h2>
      <div className="grid grid-cols-4 gap-2">
        {['Documents', 'Pictures', 'Music', 'Videos'].map(folder => (
          <div key={folder} className="p-2 border rounded text-center">
            📁 {folder}
          </div>
        ))}
      </div>
    </div>
  );

  const Settings = () => (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <input type="checkbox" />
        </div>
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
    </div>
  );

  const apps: Record<string, React.ComponentType<any>> = {
    terminal: SimpleTerminal,
    textedit: TextEditor,
    files: FileManager,
    settings: Settings,
    calculator: () => <div className="p-4">Calculator - Coming Soon</div>
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
