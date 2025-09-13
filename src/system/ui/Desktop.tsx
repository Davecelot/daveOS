export function Desktop() {
  return (
    <div 
      className="absolute inset-0 w-full h-full"
      style={{
        background: 'linear-gradient(to bottom, #4a9eff 0%, #316ac5 100%)',
      }}
    >
      {/* Desktop Icons */}
      <div className="absolute" style={{ left: 20, top: 20 }}>
        <div className="flex flex-col items-center text-white text-sm font-tahoma cursor-pointer hover:bg-blue-700 hover:bg-opacity-30 p-1 rounded">
          <div className="text-2xl mb-1">💻</div>
          <span>My Computer</span>
        </div>
      </div>
      
      <div className="absolute" style={{ left: 20, top: 120 }}>
        <div className="flex flex-col items-center text-white text-sm font-tahoma cursor-pointer hover:bg-blue-700 hover:bg-opacity-30 p-1 rounded">
          <div className="text-2xl mb-1">🌐</div>
          <span>My Network Places</span>
        </div>
      </div>
      
      <div className="absolute" style={{ left: 20, top: 220 }}>
        <div className="flex flex-col items-center text-white text-sm font-tahoma cursor-pointer hover:bg-blue-700 hover:bg-opacity-30 p-1 rounded">
          <div className="text-2xl mb-1">🗑️</div>
          <span>Recycle Bin</span>
        </div>
      </div>
    </div>
  )
}
