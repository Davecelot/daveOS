import { useState, useEffect } from 'react'
import { useWindowStore } from '../store/windows'
import { StartMenu } from './StartMenu'

export function Taskbar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showStartMenu, setShowStartMenu] = useState(false)
  const { windows } = useWindowStore()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <>
      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 grad-taskbar taskbar">
        <div className="flex items-center h-full">
          {/* Start Button */}
          <button
            onClick={() => setShowStartMenu(!showStartMenu)}
            className="h-[30px] px-5 text-white font-bold text-[11px] rounded-r-[8px] border-r-2 grad-start flex items-center shadow-sm"
            style={{
              fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
              borderRight: '1px solid rgba(0,0,0,0.3)',
              boxShadow: showStartMenu 
                ? 'inset 1px 1px 3px rgba(0,0,0,0.4)' 
                : '0 0 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-5 h-5 mr-2 bg-white bg-opacity-90 rounded-sm flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">▣</span>
            </div>
            <span style={{ fontStyle: 'italic' }}>Start</span>
          </button>

          {/* Quick Launch */}
          <div className="flex items-center h-full px-2 ml-2 border-l border-blue-300 border-opacity-50">
            <div className="flex space-x-1">
              <button className="w-6 h-6 flex items-center justify-center btn-xp text-[10px]" title="Show Desktop">
                <span>▫</span>
              </button>
              <button className="w-6 h-6 flex items-center justify-center btn-xp text-[10px]" title="Internet Explorer">
                <span>🌐</span>
              </button>
              <button className="w-6 h-6 flex items-center justify-center btn-xp text-[10px]" title="My Computer">
                <span>💻</span>
              </button>
            </div>
          </div>

          {/* Task Buttons Area */}
          <div className="flex-1 flex items-center h-full px-2">
            {Object.values(windows).map((window: any) => (
              <button
                key={window.id}
                className="taskbar-btn mx-1 min-w-[120px] max-w-[160px] h-[26px] flex items-center px-2"
                onClick={() => {
                  // Focus window logic would go here
                }}
              >
                <span className="truncate text-[11px]">{window.title}</span>
              </button>
            ))}
          </div>

          {/* System Tray */}
          <div className="flex items-center h-full px-3 bg-blue-500 bg-opacity-20 border-l border-blue-300 border-opacity-50">
            <div className="flex items-center space-x-2">
              {/* System Icons */}
              <button className="w-4 h-4 hover:bg-white hover:bg-opacity-20 rounded" title="Volume">
                <span className="text-[10px]">🔊</span>
              </button>
              <button className="w-4 h-4 hover:bg-white hover:bg-opacity-20 rounded" title="Network">
                <span className="text-[10px]">📶</span>
              </button>
              
              {/* Clock */}
              <div className="text-white px-1 cursor-default" 
                   style={{ 
                     fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif',
                     fontSize: '11px',
                     lineHeight: '1.2'
                   }}>
                <div>{formatTime(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Menu */}
      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}
    </>
  )
}
