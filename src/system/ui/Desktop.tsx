import React, { useState, useRef } from 'react'
import { Home, Trash2 } from 'lucide-react'

interface DesktopIcon {
  id: string
  name: string
  icon: React.ReactNode
  position: { x: number; y: number }
  action: () => void
}

const DEFAULT_ICONS: DesktopIcon[] = [
  {
    id: 'home',
    name: 'Home',
    icon: <Home size={32} />,
    position: { x: 20, y: 20 },
    action: () => {/* TODO: Open home folder */}
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: <Trash2 size={32} />,
    position: { x: 20, y: 100 },
    action: () => {/* TODO: Open trash */}
  }
]

export function Desktop() {
  const [icons] = useState<DesktopIcon[]>(DEFAULT_ICONS)
  const [selectedIcons, setSelectedIcons] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 })
  const desktopRef = useRef<HTMLDivElement>(null)

  const handleDesktopClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedIcons([])
    }
  }

  const handleDesktopMouseDown = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsSelecting(true)
      setSelectionStart({ x: event.clientX, y: event.clientY })
      setSelectionEnd({ x: event.clientX, y: event.clientY })
      setSelectedIcons([])
    }
  }

  const handleDesktopMouseMove = (event: React.MouseEvent) => {
    if (isSelecting) {
      setSelectionEnd({ x: event.clientX, y: event.clientY })
    }
  }

  const handleDesktopMouseUp = () => {
    if (isSelecting) {
      // Calculate selection rectangle
      const rect = {
        left: Math.min(selectionStart.x, selectionEnd.x),
        top: Math.min(selectionStart.y, selectionEnd.y),
        right: Math.max(selectionStart.x, selectionEnd.x),
        bottom: Math.max(selectionStart.y, selectionEnd.y)
      }

      // Find icons within selection
      const selectedIconIds = icons
        .filter(icon => {
          const iconElement = document.getElementById(`desktop-icon-${icon.id}`)
          if (!iconElement) return false
          
          const iconRect = iconElement.getBoundingClientRect()
          return (
            iconRect.left < rect.right &&
            iconRect.right > rect.left &&
            iconRect.top < rect.bottom &&
            iconRect.bottom > rect.top
          )
        })
        .map(icon => icon.id)

      setSelectedIcons(selectedIconIds)
      setIsSelecting(false)
    }
  }

  const handleIconClick = (iconId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      setSelectedIcons(prev => 
        prev.includes(iconId) 
          ? prev.filter(id => id !== iconId)
          : [...prev, iconId]
      )
    } else {
      setSelectedIcons([iconId])
    }
  }

  const handleIconDoubleClick = (icon: DesktopIcon, event: React.MouseEvent) => {
    event.stopPropagation()
    icon.action()
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    // TODO: Show desktop context menu
  }

  const getSelectionStyle = (): React.CSSProperties => {
    if (!isSelecting) return { display: 'none' }

    const left = Math.min(selectionStart.x, selectionEnd.x)
    const top = Math.min(selectionStart.y, selectionEnd.y)
    const width = Math.abs(selectionEnd.x - selectionStart.x)
    const height = Math.abs(selectionEnd.y - selectionStart.y)

    return {
      position: 'fixed',
      left,
      top,
      width,
      height,
      border: '1px dashed rgba(255, 255, 255, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      pointerEvents: 'none',
      zIndex: 1000
    }
  }

  return (
    <div
      ref={desktopRef}
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 -z-10"
      onClick={handleDesktopClick}
      onMouseDown={handleDesktopMouseDown}
      onMouseMove={handleDesktopMouseMove}
      onMouseUp={handleDesktopMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Icons */}
      {icons.map(icon => (
        <DesktopIconComponent
          key={icon.id}
          icon={icon}
          selected={selectedIcons.includes(icon.id)}
          onClick={(e) => handleIconClick(icon.id, e)}
          onDoubleClick={(e) => handleIconDoubleClick(icon, e)}
        />
      ))}

      {/* Selection Rectangle */}
      <div style={getSelectionStyle()} />
    </div>
  )
}

interface DesktopIconProps {
  icon: DesktopIcon
  selected: boolean
  onClick: (event: React.MouseEvent) => void
  onDoubleClick: (event: React.MouseEvent) => void
}

function DesktopIconComponent({ icon, selected, onClick, onDoubleClick }: DesktopIconProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(icon.name)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'F2' && selected) {
      setIsRenaming(true)
      setNewName(icon.name)
    } else if (event.key === 'Delete' && selected) {
      // TODO: Move to trash
    } else if (event.key === 'Enter' && isRenaming) {
      setIsRenaming(false)
      // TODO: Save new name
    } else if (event.key === 'Escape' && isRenaming) {
      setIsRenaming(false)
      setNewName(icon.name)
    }
  }

  return (
    <div
      id={`desktop-icon-${icon.id}`}
      className={`absolute flex flex-col items-center cursor-pointer select-none group ${
        selected ? 'bg-accent/20 rounded-ubuntu' : ''
      }`}
      style={{
        left: icon.position.x,
        top: icon.position.y,
        width: 80,
        height: 80
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Icon */}
      <div className={`p-2 rounded-ubuntu transition-smooth ${
        selected 
          ? 'bg-accent text-accent-foreground' 
          : 'text-white drop-shadow-lg group-hover:bg-white/10'
      }`}>
        {icon.icon}
      </div>

      {/* Label */}
      <div className="mt-1 text-center">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => setIsRenaming(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsRenaming(false)
                // TODO: Save new name
              } else if (e.key === 'Escape') {
                setIsRenaming(false)
                setNewName(icon.name)
              }
            }}
            className="bg-surface border border-surface-border rounded px-1 text-xs text-center"
            autoFocus
          />
        ) : (
          <span className={`text-xs px-1 rounded transition-smooth ${
            selected 
              ? 'bg-accent text-accent-foreground' 
              : 'text-white drop-shadow-lg bg-black/20'
          }`}>
            {icon.name}
          </span>
        )}
      </div>
    </div>
  )
}
