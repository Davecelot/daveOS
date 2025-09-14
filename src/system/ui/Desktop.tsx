import { Icon, ICON_48 } from './Icon'

export function Desktop() {
  const desktopIcons = [
    { id: 'my-computer', name: 'My Computer', icon: 'my-computer', position: { x: 20, y: 20 } },
    { id: 'my-documents', name: 'My Documents', icon: 'my-documents', position: { x: 20, y: 100 } },
    { id: 'recycle-bin', name: 'Recycle Bin', icon: 'recycle-bin', position: { x: 20, y: 180 } },
    { id: 'my-network', name: 'My Network Places', icon: 'my-network', position: { x: 20, y: 260 } },
  ]

  return (
    <div 
      className="absolute inset-0 w-full h-full"
      style={{
        background: 'linear-gradient(180deg, #6FA1D9 0%, #3B6EA5 60%, #245EDB 100%)'
      }}
    >
      {/* Desktop Icons */}
      {desktopIcons.map((icon) => (
        <div 
          key={icon.id}
          className="absolute" 
          style={{ left: icon.position.x, top: icon.position.y }}
        >
          <button 
            className="flex flex-col items-center p-2 rounded hover:bg-blue-400 hover:bg-opacity-30 focus:bg-blue-400 focus:bg-opacity-40 focus:outline-none"
            style={{ width: '75px' }}
            onDoubleClick={() => {
              console.log(`Opening ${icon.name}`)
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-md">
              <Icon name={icon.icon} size={ICON_48} alt={icon.name} />
            </div>
            <span className="icon-label text-white text-center break-words select-none" 
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif'
                  }}>
              {icon.name}
            </span>
          </button>
        </div>
      ))}
    </div>
  )
}
