import { Icon, ICON_16, ICON_32 } from './Icon'
import { useWindowStore } from '../store/windows'

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowStore()
  
  const handleAppClick = (appId: string) => {
    const appTitles: Record<string, string> = {
      cmd: 'Command Prompt',
      files: 'My Computer',
      internet: 'Internet Explorer',
      email: 'Outlook Express',
      mediaplayer: 'Windows Media Player',
      calculator: 'Calculator',
      textedit: 'Notepad',
      settings: 'Control Panel'
    }
    
    openWindow({
      appId,
      title: appTitles[appId] || appId,
      bounds: {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: appId === 'cmd' ? 800 : 600,
        height: appId === 'cmd' ? 500 : 400
      }
    })
    onClose()
  }

  const leftPanelApps = [
    { id: 'internet', name: 'Internet', icon: 'internet', subtitle: 'Internet Explorer' },
    { id: 'email', name: 'E-mail', icon: 'email', subtitle: 'Outlook Express' },
    { id: 'cmd', name: 'Command Prompt', icon: 'cmd', subtitle: '' },
    { id: 'mediaplayer', name: 'Windows Media Player', icon: 'wmp', subtitle: '' },
    { id: 'tour', name: 'Tour Windows XP', icon: 'help', subtitle: '' },
    { id: 'files', name: 'Files and Settings Transfer Wizard', icon: 'folder', subtitle: '' },
  ]

  const rightPanelItems = [
    { id: 'documents', name: 'My Documents', icon: 'documents', type: 'folder' },
    { id: 'recent', name: 'My Recent Documents', icon: 'documents', type: 'folder', hasArrow: true },
    { id: 'pictures', name: 'My Pictures', icon: 'pictures', type: 'folder' },
    { id: 'music', name: 'My Music', icon: 'music', type: 'folder' },
    { id: 'computer', name: 'My Computer', icon: 'my-computer', type: 'folder' },
    { id: 'control', name: 'Control Panel', icon: 'control-panel', type: 'system' },
    { id: 'programs', name: 'Set Program Access and Defaults', icon: 'settings', type: 'system' },
    { id: 'printers', name: 'Printers and Faxes', icon: 'printers', type: 'system' },
    { id: 'help', name: 'Help and Support', icon: 'help', type: 'system' },
    { id: 'search', name: 'Search', icon: 'search', type: 'system' },
    { id: 'run', name: 'Run...', icon: 'run', type: 'system' },
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
          <div className="w-48 px-2 py-3 start-left">
            <div className="space-y-0">
              {leftPanelApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="start-app"
                >
                  <span className="w-8 h-8 flex items-center justify-center text-lg mr-2">
                    <Icon name={app.icon} size={ICON_32} alt={app.name} />
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
          <div className="flex-1 px-3 py-3 start-right">
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
                  className="start-item"
                >
                  <span className="w-5 h-5 flex items-center justify-center mr-2 text-sm">
                    <Icon name={item.icon} size={ICON_16} alt={item.name} />
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
          className="h-12 flex items-center justify-end px-4 border-t start-footer"
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
