import React from 'react'
import { useSessionStore } from '../store/session'
import { useWindowStore } from '../store/windows'

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowStore()

  const handleAppClick = (appId: string) => {
    // TODO: Implement proper app opening
    console.log(`Opening app: ${appId}`)
    onClose()
  }

  const leftPanelApps = [
    { id: 'internet', name: 'Internet', icon: '🌐', subtitle: 'Internet Explorer' },
    { id: 'email', name: 'E-mail', icon: '📧', subtitle: 'Outlook Express' },
    { id: 'mediaplayer', name: 'Windows Media Player', icon: '🎵', subtitle: '' },
    { id: 'tour', name: 'Tour Windows XP', icon: '🚀', subtitle: '' },
    { id: 'files', name: 'Files and Settings Transfer Wizard', icon: '📁', subtitle: '' },
  ]

  const rightPanelItems = [
    { id: 'documents', name: 'My Documents', icon: '📄', type: 'folder' },
    { id: 'recent', name: 'My Recent Documents', icon: '📋', type: 'folder', hasArrow: true },
    { id: 'pictures', name: 'My Pictures', icon: '🖼️', type: 'folder' },
    { id: 'music', name: 'My Music', icon: '🎵', type: 'folder' },
    { id: 'computer', name: 'My Computer', icon: '💻', type: 'folder' },
    { id: 'control', name: 'Control Panel', icon: '⚙️', type: 'system' },
    { id: 'programs', name: 'Set Program Access and Defaults', icon: '🔧', type: 'system' },
    { id: 'printers', name: 'Printers and Faxes', icon: '🖨️', type: 'system' },
    { id: 'help', name: 'Help and Support', icon: '❓', type: 'system' },
    { id: 'search', name: 'Search', icon: '🔍', type: 'system' },
    { id: 'run', name: 'Run...', icon: '▶️', type: 'system' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Start Menu */}
      <div 
        className="fixed bottom-8 left-0 z-50 w-96 h-96 bg-white rounded-tr-lg shadow-xl"
        style={{
          border: '2px outset #ece9d8',
          background: 'linear-gradient(to right, #4a9eff 0%, #316ac5 50%, #f6f6f6 50%, #f6f6f6 100%)'
        }}
      >
        {/* Header */}
        <div 
          className="h-16 flex items-end px-4 pb-2"
          style={{
            background: 'linear-gradient(to right, #4a9eff 0%, #316ac5 50%)',
            color: 'white'
          }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded mr-3 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <span className="font-bold text-lg">Administrator</span>
          </div>
        </div>

        <div className="flex h-80">
          {/* Left Panel - Frequently Used Programs */}
          <div className="w-48 p-2" style={{ background: '#f6f6f6' }}>
            <div className="space-y-1">
              {leftPanelApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="w-full flex items-center p-2 text-left hover:bg-blue-100 hover:border hover:border-blue-300 rounded text-xs"
                >
                  <span className="w-8 h-8 flex items-center justify-center text-lg mr-2">
                    {app.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-black">{app.name}</div>
                    {app.subtitle && (
                      <div className="text-gray-600 text-xs">{app.subtitle}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* All Programs */}
            <div className="mt-4 pt-2 border-t border-gray-300">
              <button 
                className="flex items-center w-full p-2 text-left hover:bg-blue-100 hover:border hover:border-blue-300 rounded text-xs"
                onClick={() => {/* Handle All Programs */}}
              >
                <span className="w-8 h-8 flex items-center justify-center text-lg mr-2">📋</span>
                <span className="font-semibold text-black">All Programs</span>
                <span className="ml-auto">▶</span>
              </button>
            </div>
          </div>

          {/* Right Panel - System Items */}
          <div className="flex-1 p-2 bg-white">
            <div className="space-y-1">
              {rightPanelItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'folder') {
                      handleAppClick('files')
                    } else {
                      handleAppClick(item.id)
                    }
                  }}
                  className="w-full flex items-center p-1 text-left hover:bg-blue-100 hover:border hover:border-blue-300 rounded text-xs"
                >
                  <span className="w-6 h-6 flex items-center justify-center mr-2">
                    {item.icon}
                  </span>
                  <span className="text-black">{item.name}</span>
                  {item.hasArrow && <span className="ml-auto">▶</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="h-8 flex items-center justify-end px-4 border-t"
          style={{ borderColor: '#8a867a', background: 'linear-gradient(to bottom, #f1efe2, #ece9d8)' }}
        >
          <button 
            className="flex items-center px-3 py-1 text-xs hover:bg-blue-100 hover:border hover:border-blue-300 rounded"
            onClick={() => {/* Handle Log Off */}}
          >
            <span className="w-4 h-4 mr-1">🚪</span>
            Log Off
          </button>
          <button 
            className="flex items-center px-3 py-1 ml-2 text-xs hover:bg-red-100 hover:border hover:border-red-300 rounded"
            onClick={() => {/* Handle Turn Off Computer */}}
          >
            <span className="w-4 h-4 mr-1">⏻</span>
            Turn Off Computer
          </button>
        </div>
      </div>
    </>
  )
}
