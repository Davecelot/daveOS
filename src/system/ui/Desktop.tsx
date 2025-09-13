export function Desktop() {
  const desktopIcons = [
    { id: 'my-computer', name: 'My Computer', icon: '💻', position: { x: 20, y: 20 } },
    { id: 'my-documents', name: 'My Documents', icon: '📁', position: { x: 20, y: 100 } },
    { id: 'recycle-bin', name: 'Recycle Bin', icon: '🗑️', position: { x: 20, y: 180 } },
    { id: 'my-network', name: 'My Network Places', icon: '🌐', position: { x: 20, y: 260 } },
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
            <div className="w-12 h-12 flex items-center justify-center text-3xl mb-1 drop-shadow-md">
              {icon.icon}
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
