import React, { useRef, useEffect, useCallback } from 'react';
import { useWindowStore } from '../store/windows';
import { useSessionStore } from '../store/session';
import { useDragResize } from './useDragResize';
import { Icon, ICON_16 } from '@/system/ui/Icon';
import { appIdToIcon } from '@/system/ui/icons';
import { FileManager } from '../apps/FileManager';
import { TextEdit } from '../apps/TextEdit';
import { Calculator } from '../apps/Calculator';
import { Notes } from '../apps/Notes';
import { ImageViewer } from '../apps/ImageViewer';
import { Settings } from '../apps/Settings';
import { Calendar } from '../apps/Calendar';
import { SystemMonitor } from '../apps/SystemMonitor';
import { SimpleTerminal } from '../apps/SimpleTerminal';
import { Terminal } from '../apps/Terminal';
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
  const snapToHalf = useCallback((side: 'left' | 'right') => ({
    x: side === 'left' ? 0 : globalThis.innerWidth / 2,
    y: 0,
    width: globalThis.innerWidth / 2,
    height: globalThis.innerHeight
  }), [])
  
  const snapToMaximize = useCallback(() => ({
    x: 0,
    y: 0,
    width: globalThis.innerWidth,
    height: globalThis.innerHeight
  }), [])

  const {
    isDragging,
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
      className={`fixed overflow-hidden ${window.focused ? '' : 'opacity-95'} ${window.maximized ? 'rounded-none' : ''}`}
      style={{
        ...windowStyle,
        // XP window border stack
        border: '1px solid #0831D9',
        borderTopLeftRadius: window.maximized ? 0 : 6,
        borderTopRightRadius: window.maximized ? 0 : 6,
        boxShadow: window.maximized ? 'none' : [
          'inset 0 0 0 1px #3B6EA5',
          'inset 0 0 0 2px #9DB9EB',
          '3px 3px 8px rgba(0,0,0,0.4)'
        ].join(', '),
        background: 'var(--win-surface)'
      }}
      onMouseDown={handleWindowClick}
    >
      {/* XP Titlebar */}
      <div
        className={`px-2 flex items-center justify-between cursor-move select-none ${window.maximized ? '' : ''}`}
        onMouseDown={window.movable ? handleMouseDown : undefined}
        onDoubleClick={handleTitlebarDoubleClick}
        style={{
          background: window.focused 
            ? 'linear-gradient(180deg, var(--xp-title-blue-mid) 0%, var(--xp-title-blue-light) 100%)'
            : 'linear-gradient(180deg, var(--xp-title-inact-dark) 0%, var(--xp-title-inact-light) 100%)',
          color: window.focused ? '#fff' : '#234',
          textShadow: window.focused ? '0 1px 0 rgba(0,0,0,.35)' : 'none',
          height: 22,
          borderTopLeftRadius: window.maximized ? 0 : 6,
          borderTopRightRadius: window.maximized ? 0 : 6,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="mr-1 flex-shrink-0">
            <Icon name={appIdToIcon(window.appId)} size={ICON_16} alt={window.appId} />
          </span>
          <span className="font-bold truncate" style={{ fontFamily: 'Tahoma, \"Segoe UI\", system-ui, sans-serif', fontSize: 11 }}>{window.title}</span>
        </div>
        
        {/* XP window controls */}
        <div className="flex items-center space-x-1">
          {window.minimizable && (
            <button
              className="w-5 h-5 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id) }}
              title="Minimize"
              style={{
                background: 'linear-gradient(180deg, #FEFEFE 0%, #E6E6E6 100%)',
                border: '1px solid #7F9DB9',
                boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #A0A0A0',
                borderRadius: 2
              }}
            >
              <div style={{ width: 9, height: 2, background: '#245EDB', marginTop: 4 }} />
            </button>
          )}
          {window.maximizable && (
            <button
              className="w-5 h-5 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                if (window.maximized) { restoreWindow(window.id) } else { maximizeWindow(window.id) }
              }}
              title={window.maximized ? 'Restore' : 'Maximize'}
              style={{
                background: 'linear-gradient(180deg, #FEFEFE 0%, #E6E6E6 100%)',
                border: '1px solid #7F9DB9',
                boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #A0A0A0',
                borderRadius: 2
              }}
            >
              <div style={{ width: 9, height: 7, border: '1px solid #245EDB' }} />
            </button>
          )}
          {window.closable && (
            <button
              className="w-5 h-5 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); closeWindow(window.id) }}
              title="Close"
              style={{
                background: 'linear-gradient(180deg, #F5A9A9 0%, #C84545 100%)',
                border: '1px solid #A83333',
                borderRadius: 2,
                color: '#fff',
                textShadow: '0 1px 0 rgba(0,0,0,0.3)'
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}>×</span>
            </button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden" style={{ background: 'var(--win-surface)', borderTop: '1px solid #D6E3F5' }}>
        {children}
      </div>

      {/* Decorative resize grip (bottom-right) */}
      {window.resizable && !window.maximized && (
        <div
          style={{
            position: 'absolute',
            right: 2,
            bottom: 2,
            width: 14,
            height: 14,
            background: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.15) 0 2px, rgba(255,255,255,0.6) 2px 4px)',
            borderRadius: 2,
            opacity: 0.6
          }}
        />
      )}

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
    cmd: Terminal,
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
