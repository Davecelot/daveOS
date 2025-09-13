import { useState, useRef, useEffect } from 'react'
import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react'

interface WindowXPProps {
  title: string
  children: ReactNode
  isActive?: boolean
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
}

export function WindowXP({
  title,
  children,
  isActive = true,
  onClose,
  onMinimize,
  onMaximize,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 400, height: 300 }
}: WindowXPProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  return (
    <div
      ref={windowRef}
      className="window fixed shadow-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: '3px solid #0831d9',
        borderRadius: '8px 8px 0 0',
        zIndex: isActive ? 1000 : 999
      }}
    >
      {/* Titlebar */}
      <div
        className={`titlebar ${isActive ? 'grad-title-active' : 'grad-title-inactive'} ${isDragging ? 'select-none' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          borderRadius: '6px 6px 0 0',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="flex items-center justify-between h-full px-2">
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2">🪟</span>
            <span className={`${isActive ? 'text-white' : 'text-gray-700'} font-bold`}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif',
                    textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
              {title}
            </span>
          </div>
          
          {/* Window Controls */}
          <div className="window-controls flex items-center space-x-1">
            <button
              onClick={onMinimize}
              className="w-5 h-5 flex items-center justify-center btn-xp hover:bg-blue-200"
              title="Minimize"
            >
              <span style={{ fontSize: '10px', marginTop: '-4px' }}>_</span>
            </button>
            <button
              onClick={onMaximize}
              className="w-5 h-5 flex items-center justify-center btn-xp hover:bg-blue-200"
              title="Maximize"
            >
              <span style={{ fontSize: '10px' }}>□</span>
            </button>
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white"
              style={{
                background: 'linear-gradient(180deg, #FF9494 0%, #C84545 100%)',
                border: '1px solid #A83333',
                borderRadius: '2px'
              }}
              title="Close"
            >
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>✕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto" style={{
        background: 'var(--win-surface)',
        height: 'calc(100% - 28px)'
      }}>
        {children}
      </div>
    </div>
  )
}
