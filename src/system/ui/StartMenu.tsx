interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const handleAppClick = (appId: string) => {
    // TODO: Implement proper app opening using openWindow
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
        className="fixed left-0 z-50 start-menu"
        style={{
          bottom: '32px',
          width: '380px',
          height: '480px',
          borderRadius: '0 8px 0 0',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #6FA1D9 0%, #316AC5 100%) 1',
          boxShadow: '2px -2px 8px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <div 
          className="h-16 flex items-end px-4 pb-2 grad-title-active rounded-tr-lg"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full mr-3 flex items-center justify-center border-2 border-white border-opacity-50">
              <span className="text-2xl">👤</span>
            </div>
            <span className="text-white font-bold text-sm" style={{
              fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>Administrator</span>
          </div>
        </div>

        <div className="flex" style={{ height: 'calc(100% - 112px)' }}>
          {/* Left Panel - Frequently Used Programs */}
          <div className="w-48 px-2 py-3" style={{ background: 'var(--win-surface)' }}>
            <div className="space-y-0">
              {leftPanelApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="w-full flex items-center px-2 py-1 text-left hover:bg-blue-100 rounded"
                  style={{ minHeight: '42px' }}
                >
                  <span className="w-8 h-8 flex items-center justify-center text-lg mr-2">
                    {app.icon}
                  </span>
                  <div>
                    <div className="font-bold text-black" style={{
                      fontSize: '11px',
                      fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
                    }}>{app.name}</div>
                    {app.subtitle && (
                      <div className="text-gray-600" style={{
                        fontSize: '10px',
                        fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
                      }}>{app.subtitle}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* All Programs */}
            <div className="mt-auto pt-3 border-t border-gray-300">
              <button 
                className="flex items-center w-full px-2 py-2 text-left hover:bg-blue-100 rounded"
                onClick={() => {/* Handle All Programs */}}
              >
                <span className="text-green-600 font-bold mr-2" style={{ fontSize: '14px' }}>▣</span>
                <span className="font-bold text-green-700" style={{
                  fontSize: '11px',
                  fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
                }}>All Programs</span>
                <span className="ml-auto text-black">▶</span>
              </button>
            </div>
          </div>

          {/* Right Panel - System Items */}
          <div className="flex-1 px-3 py-3" style={{ background: '#DDE7F6' }}>
            <div className="space-y-0">
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
                  className="w-full flex items-center px-2 py-1 text-left hover:bg-blue-200 rounded"
                  style={{ minHeight: '26px' }}
                >
                  <span className="w-5 h-5 flex items-center justify-center mr-2 text-sm">
                    {item.icon}
                  </span>
                  <span className="text-black" style={{
                    fontSize: '11px',
                    fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
                  }}>{item.name}</span>
                  {item.hasArrow && <span className="ml-auto text-gray-600">▶</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="h-12 flex items-center justify-end px-4 border-t grad-title-active"
        >
          <button 
            className="flex items-center px-3 py-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
            onClick={() => {/* Handle Log Off */}}
            style={{
              fontSize: '11px',
              fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
            }}
          >
            <span className="w-4 h-4 mr-1">🚪</span>
            Log Off
          </button>
          <button 
            className="flex items-center px-3 py-1 ml-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            onClick={() => {/* Handle Turn Off Computer */}}
            style={{
              fontSize: '11px',
              fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
            }}
          >
            <span className="w-4 h-4 mr-1">⏻</span>
            Turn Off Computer
          </button>
        </div>
      </div>
    </>
  )
}
