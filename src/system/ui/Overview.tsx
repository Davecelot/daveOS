import React, { useState } from 'react'
import { Search, Grid3X3 } from 'lucide-react'
import { useSessionStore } from '../store/session'
import { useWindowStore } from '../store/windows'
import { useSettingsStore } from '../store/settings'

export function Overview() {
  const { isOverviewOpen, closeOverview, workspaces, currentWorkspace, switchToWorkspace } = useSessionStore()
  const { windows, focusWindow } = useWindowStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAppGrid, setShowAppGrid] = useState(false)

  if (!isOverviewOpen) return null

  const currentWorkspaceWindows = Object.values(windows)
    .filter(window => window.workspace === currentWorkspace && window.visible && !window.minimized)

  const handleWindowClick = (windowId: string) => {
    focusWindow(windowId)
    closeOverview()
  }

  const handleWorkspaceClick = (workspaceId: number) => {
    if (workspaceId !== currentWorkspace) {
      switchToWorkspace(workspaceId)
    }
    closeOverview()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeOverview()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="h-full flex flex-col">
        {/* Search Bar */}
        <div className="flex justify-center pt-16 pb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={20} />
            <input
              type="text"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-border rounded-ubuntu text-lg focus-ring"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Windows Overview */}
          <div className="flex-1 px-16">
            <div className="mb-8">
              <h2 className="text-xl font-medium text-white mb-4">Windows</h2>
              {currentWorkspaceWindows.length === 0 ? (
                <div className="text-center py-16 text-white/60">
                  <p>No open windows</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {currentWorkspaceWindows.map(window => (
                    <WindowThumbnail
                      key={window.id}
                      window={window}
                      onClick={() => handleWindowClick(window.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* App Grid Toggle */}
          <div className="w-16 flex flex-col items-center pt-8">
            <button
              className="w-12 h-12 bg-surface/80 hover:bg-surface rounded-ubuntu flex items-center justify-center transition-smooth"
              onClick={() => setShowAppGrid(!showAppGrid)}
              title="Show Applications"
            >
              <Grid3X3 size={24} />
            </button>
          </div>
        </div>

        {/* Workspaces */}
        <div className="px-16 pb-16">
          <h3 className="text-lg font-medium text-white mb-4">Workspaces</h3>
          <div className="flex space-x-4">
            {workspaces.map(workspace => (
              <WorkspaceThumbnail
                key={workspace.id}
                workspace={workspace}
                active={workspace.id === currentWorkspace}
                onClick={() => handleWorkspaceClick(workspace.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* App Grid Overlay */}
      {showAppGrid && (
        <AppGrid onClose={() => setShowAppGrid(false)} />
      )}
    </div>
  )
}

interface WindowThumbnailProps {
  window: any
  onClick: () => void
}

function WindowThumbnail({ window, onClick }: WindowThumbnailProps) {
  return (
    <div
      className="bg-surface border border-surface-border rounded-ubuntu p-4 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-ubuntu"
      onClick={onClick}
    >
      <div className="aspect-video bg-background rounded-ubuntu-sm mb-2 flex items-center justify-center text-foreground-muted">
        <span className="text-sm">{window.appId}</span>
      </div>
      <p className="text-sm font-medium truncate">{window.title}</p>
    </div>
  )
}

interface WorkspaceThumbnailProps {
  workspace: any
  active: boolean
  onClick: () => void
}

function WorkspaceThumbnail({ workspace, active, onClick }: WorkspaceThumbnailProps) {
  return (
    <div
      className={`w-32 h-20 rounded-ubuntu border-2 cursor-pointer transition-smooth ${
        active 
          ? 'border-accent bg-accent/20' 
          : 'border-white/20 bg-white/10 hover:border-white/40'
      }`}
      onClick={onClick}
    >
      <div className="h-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">{workspace.name}</span>
      </div>
    </div>
  )
}

function AppGrid({ onClose }: { onClose: () => void }) {
  const { settings } = useSettingsStore()
  const { openWindow } = useWindowStore()
  const [searchQuery, setSearchQuery] = useState('')

  const apps = [
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
    { id: 'textedit', name: 'Text Editor', icon: '📝' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'imageviewer', name: 'Image Viewer', icon: '🖼️' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'videoplayer', name: 'Video Player', icon: '🎬' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'notes', name: 'Notes', icon: '📋' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣' }
  ]

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAppClick = (appId: string) => {
    openWindow({
      appId,
      title: apps.find(app => app.id === appId)?.name || appId,
      bounds: { x: 100, y: 100, width: 800, height: 600 },
      workspace: 1
    })
    onClose()
  }

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
      <div className="w-2/3 max-w-4xl">
        {/* Search */}
        <div className="mb-8">
          <div className="relative w-96 mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-border rounded-ubuntu focus-ring"
              autoFocus
            />
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-6 gap-6">
          {filteredApps.map(app => (
            <div
              key={app.id}
              className="flex flex-col items-center p-4 rounded-ubuntu hover:bg-white/10 cursor-pointer transition-smooth"
              onClick={() => handleAppClick(app.id)}
            >
              <div className="text-4xl mb-2">{app.icon}</div>
              <span className="text-white text-sm text-center">{app.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
