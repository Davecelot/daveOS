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
      className="fixed"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        // XP window border stack: dark outer, mid blue inner, light highlight
        border: '1px solid #0831D9',
        borderRadius: '7px 7px 0 0',
        boxShadow: [
          'inset 0 0 0 1px #3B6EA5',      // inner mid blue
          'inset 0 0 0 2px #9DB9EB',      // inner light highlight
          '3px 3px 8px rgba(0,0,0,0.4)'   // outer drop shadow
        ].join(', '),
        background: 'var(--win-surface)',
        zIndex: isActive ? 1000 : 999
      }}
    >
      {/* Titlebar */}
      <div
        className={`titlebar ${isActive ? 'grad-title-active' : 'grad-title-inactive'} ${isDragging ? 'select-none' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          borderRadius: '6px 6px 0 0',
          height: 22,
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        <div className="flex items-center justify-between h-full px-2">
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2">🪟</span>
            <span className={`${isActive ? 'text-white' : 'text-gray-700'} font-bold`}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif',
                    textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
              {title}
            </span>
          </div>
          
          {/* Window Controls */}
          <div className="window-controls flex items-center space-x-1">
            {/* Minimize */}
            <button
              onClick={onMinimize}
              className="w-5 h-5 flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #FEFEFE 0%, #E6E6E6 100%)',
                border: '1px solid #7F9DB9',
                boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #A0A0A0',
                borderRadius: 2
              }}
              title="Minimize"
            >
              <div style={{ width: 9, height: 2, background: '#245EDB', marginTop: 4 }} />
            </button>
            {/* Maximize */}
            <button
              onClick={onMaximize}
              className="w-5 h-5 flex items-center justify-center hover:bg-gray-200"
              style={{
                background: 'linear-gradient(180deg, #FEFEFE 0%, #E6E6E6 100%)',
                border: '1px solid #7F9DB9',
                boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #A0A0A0',
                borderRadius: 2
              }}
              title="Maximize"
            >
              <div style={{ width: 9, height: 7, border: '1px solid #245EDB' }} />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center hover:bg-red-500"
              style={{
                background: 'linear-gradient(180deg, #F5A9A9 0%, #C84545 100%)',
                border: '1px solid #A83333',
                borderRadius: 2,
                color: '#fff',
                textShadow: '0 1px 0 rgba(0,0,0,0.3)'
              }}
              title="Close"
            >
              <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}>×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto" style={{
        background: 'var(--win-surface)',
        height: 'calc(100% - 22px)',
        borderTop: '1px solid #D6E3F5'
      }}>
        {children}
      </div>

      {/* Resize grip (bottom-right) */}
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
    </div>
  )
}
