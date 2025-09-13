import React, { useState, useEffect } from 'react'
import { useSessionStore } from '../store/session'
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <>
      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-8 z-50" 
           style={{
             background: 'linear-gradient(to bottom, #4582ff 0%, #1d74f5 50%, #0e5395 100%)',
             border: '1px solid #003d7a',
             borderBottom: 'none'
           }}>
        <div className="flex items-center h-full">
          {/* Start Button */}
          <button
            onClick={() => setShowStartMenu(!showStartMenu)}
            className="flex items-center h-full px-4 text-white font-bold text-sm hover:bg-white hover:bg-opacity-10 transition-colors"
            style={{
              background: showStartMenu ? 'inset 1px 1px 2px rgba(0,0,0,0.3)' : 'none',
              border: showStartMenu ? '1px inset #8a867a' : '1px outset #ffffff'
            }}
          >
            <img 
              src="/icons/windows-logo.png" 
              alt="Windows" 
              className="w-4 h-4 mr-2"
              onError={(e) => {
                // Fallback if image doesn't exist
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span>start</span>
          </button>

          {/* Quick Launch */}
          <div className="flex items-center h-full px-2 border-r border-white border-opacity-30">
            <div className="flex space-x-1">
              <button className="w-6 h-6 bg-white bg-opacity-20 rounded hover:bg-opacity-40">
                <span className="text-xs">IE</span>
              </button>
              <button className="w-6 h-6 bg-white bg-opacity-20 rounded hover:bg-opacity-40">
                <span className="text-xs">📁</span>
              </button>
            </div>
          </div>

          {/* Task Buttons Area */}
          <div className="flex-1 flex items-center h-full px-2">
            {Object.values(windows).map((window: any) => (
              <button
                key={window.id}
                className="flex items-center px-3 py-1 mx-1 text-white text-xs bg-white bg-opacity-10 hover:bg-opacity-20 rounded border border-white border-opacity-30 max-w-40 truncate"
                onClick={() => {
                  // Focus window logic would go here
                }}
              >
                <span className="truncate">{window.title}</span>
              </button>
            ))}
          </div>

          {/* System Tray */}
          <div className="flex items-center h-full px-3 border-l border-white border-opacity-30">
            <div className="flex items-center space-x-2">
              {/* System Icons */}
              <div className="w-4 h-4 bg-white bg-opacity-80 rounded-sm flex items-center justify-center">
                <span className="text-xs text-blue-600">🔊</span>
              </div>
              <div className="w-4 h-4 bg-white bg-opacity-80 rounded-sm flex items-center justify-center">
                <span className="text-xs text-blue-600">📶</span>
              </div>
              
              {/* Clock */}
              <div className="text-white text-xs font-semibold px-1 leading-tight">
                <div>{formatTime(currentTime)}</div>
                <div>{formatDate(currentTime)}</div>
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
