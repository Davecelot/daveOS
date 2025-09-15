import React, { useState, useEffect } from 'react';
import { ExplorerLayout } from './ExplorerLayout';
import { useSimpleFileSystemStore } from '@/system/store/simple-filesystem';

export const FileManager: React.FC = () => {
  const { currentPath, currentEntries, initialize } = useSimpleFileSystemStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    initialize();
  }, []);
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Menú superior estilo XP */}
      <div className="flex items-center p-1 bg-gray-100 border-b border-gray-300 text-sm">
        <div className="dropdown">
          <button className="px-2 py-1 hover:bg-gray-200">Archivo</button>
          <div className="dropdown-content">
            <button>Nuevo</button>
            <button>Abrir</button>
            <button>Guardar</button>
          </div>
        </div>
        <button className="px-2 py-1 hover:bg-gray-200">Editar</button>
        <button className="px-2 py-1 hover:bg-gray-200">Ver</button>
        <button className="px-2 py-1 hover:bg-gray-200">Favoritos</button>
        <button className="px-2 py-1 hover:bg-gray-200">Herramientas</button>
        <button className="px-2 py-1 hover:bg-gray-200">Ayuda</button>
        
        {/* Barra de búsqueda */}
        <div className="ml-auto flex items-center">
          <input 
            type="text" 
            placeholder="Buscar en esta carpeta..." 
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="ml-1 px-2 py-1 bg-blue-500 text-white text-sm rounded">Buscar</button>
        </div>
      </div>
      
      {/* Área principal del explorador */}
      <div className="flex-1">
        <ExplorerLayout 
          entries={currentEntries} 
          currentPath={currentPath}
        />
      </div>
      
      {/* Barra de estado */}
      <div className="p-1 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
        15 objetos | 245 MB libres
      </div>
    </div>
  );
};
