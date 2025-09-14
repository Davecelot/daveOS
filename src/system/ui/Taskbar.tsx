import { useState, useEffect } from 'react'
import { useWindowStore } from '../store/windows'
import { StartMenu } from './StartMenu'
import { Icon, ICON_16 } from './Icon'
import { appIdToIcon } from './icons'

export function Taskbar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [showDesktop, setShowDesktop] = useState(false)
  const [minimizedByToggle, setMinimizedByToggle] = useState<string[]>([])
  const { windows, minimizeWindow, restoreWindow, focusWindow } = useWindowStore()

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

  const handleShowDesktop = () => {
    if (!showDesktop) {
      const toMinimize: string[] = []
      Object.values(windows).forEach((w: any) => {
        if (!w.minimized) {
          toMinimize.push(w.id)
          minimizeWindow(w.id)
        }
      })
      setMinimizedByToggle(toMinimize)
      setShowDesktop(true)
    } else {
      minimizedByToggle.forEach((id) => restoreWindow(id))
      setMinimizedByToggle([])
      setShowDesktop(false)
    }
  }

  return (
    <>
      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 grad-taskbar taskbar">
        <div className="flex items-center h-full">
          {/* Start Button */}
          <button
            onClick={() => setShowStartMenu(!showStartMenu)}
            className="h-[30px] px-5 text-white font-bold text-[11px] rounded-r-[8px] border-r-2 grad-start flex items-center shadow-sm start-button"
            data-pressed={showStartMenu}
            style={{
              fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif',
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
              borderRight: '1px solid rgba(0,0,0,0.3)',
              boxShadow: showStartMenu 
                ? 'inset 1px 1px 3px rgba(0,0,0,0.4)' 
                : '0 0 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-5 h-5 mr-2 bg-white bg-opacity-90 rounded-sm flex items-center justify-center overflow-hidden">
              <Icon name="start" size={ICON_16} alt="Start" />
            </div>
            <span style={{ fontStyle: 'italic' }}>start</span>
          </button>

          {/* Quick Launch */}
          <div className="flex items-center h-full px-2 ml-2 border-l border-blue-300 border-opacity-50">
            <div className="flex space-x-1">
              <button
                className="w-6 h-6 flex items-center justify-center btn-xp"
                title="Show Desktop"
                onClick={handleShowDesktop}
                aria-pressed={showDesktop}
                data-pressed={showDesktop}
              >
                <Icon name="show-desktop" size={ICON_16} alt="Show Desktop" />
              </button>
              <button className="w-6 h-6 flex items-center justify-center btn-xp" title="Internet Explorer">
                <Icon name="internet" size={ICON_16} alt="Internet" />
              </button>
              <button className="w-6 h-6 flex items-center justify-center btn-xp" title="My Computer">
                <Icon name="my-computer" size={ICON_16} alt="My Computer" />
              </button>
            </div>
          </div>

          {/* Task Buttons Area */}
          <div className="flex-1 flex items-center h-full px-2 overflow-x-auto">
            {Object.values(windows).map((window: any) => {
              const isActive = window.focused && !window.minimized
              return (
                <button
                  key={window.id}
                  className={`taskbar-btn mx-1 min-w-[140px] max-w-[200px] h-[26px] flex items-center px-2 ${isActive ? 'active' : ''}`}
                  title={window.title}
                  onClick={() => {
                    if (window.minimized) {
                      restoreWindow(window.id)
                      focusWindow(window.id)
                    } else if (window.focused) {
                      minimizeWindow(window.id)
                    } else {
                      focusWindow(window.id)
                    }
                  }}
                >
                  <span className="mr-2 flex-shrink-0">
                    <Icon name={appIdToIcon(window.appId)} size={ICON_16} alt={window.appId} />
                  </span>
                  <span className="truncate text-[11px]">{window.title}</span>
                </button>
              )
            })}
          </div>

          {/* System Tray */}
          <div className="flex items-center h-full px-3 bg-blue-500 bg-opacity-20 border-l border-blue-300 border-opacity-50">
            <div className="flex items-center space-x-2">
              {/* System Icons */}
              <div className="w-4 h-4 flex items-center justify-center" title="Volume">
                <Icon name="volume" size={ICON_16} alt="Volume" />
              </div>
              <div className="w-4 h-4 flex items-center justify-center" title="Network">
                <Icon name="network" size={ICON_16} alt="Network" />
              </div>
              
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
