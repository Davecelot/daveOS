import React, { useState } from 'react';
import { Icon, ICON_16, ICON_24, ICON_32, ICON_48 } from '@/system/ui/Icon';
import { ViewMode } from './types';
import { SimpleEntry } from '@/system/fs/simple-api';

interface ExplorerLayoutProps {
  entries: SimpleEntry[];
  currentPath: string;
}

export const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({ entries, currentPath }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  
  return (
    <div className="flex h-full bg-white border border-gray-300">
      {/* Task Panel (Left) */}
      <div className="w-48 p-2 bg-gray-50 border-r border-gray-300">
        <div className="text-xs font-bold text-gray-600 mb-2">Tareas del sistema</div>
        <div className="space-y-1">
          <button className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded">
            <Icon name="folder" size={ICON_16} className="mr-2" />
            <span>Ver información del sistema</span>
          </button>
          <button className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded">
            <Icon name="search" size={ICON_16} className="mr-2" />
            <span>Buscar archivos</span>
          </button>
          <button className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded">
            <Icon name="my-documents" size={ICON_16} className="mr-2" />
            <span>Compartir esta carpeta</span>
          </button>
        </div>
        
        <div className="mt-4 text-xs font-bold text-gray-600 mb-2">Otras ubicaciones</div>
        <div className="space-y-1">
          <button className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded">
            <Icon name="my-computer" size={ICON_16} className="mr-2" />
            <span>Mi PC</span>
          </button>
          <button className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded">
            <Icon name="my-network" size={ICON_16} className="mr-2" />
            <span>Mis sitios de red</span>
          </button>
          <button className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded">
            <Icon name="recycle-bin" size={ICON_16} className="mr-2" />
            <span>Papelera de reciclaje</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-1 bg-gray-100 border-b border-gray-300 flex items-center">
          <button className="p-1 mx-1 hover:bg-gray-200 rounded" title="Atrás">
            <Icon name="back" size={ICON_24} />
          </button>
          <button className="p-1 mx-1 hover:bg-gray-200 rounded" title="Adelante">
            <Icon name="forward" size={ICON_24} />
          </button>
          <button className="p-1 mx-1 hover:bg-gray-200 rounded" title="Subir">
            <Icon name="up" size={ICON_24} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button 
            className={`p-1 mx-1 rounded ${viewMode === 'icons' ? 'bg-blue-200' : 'hover:bg-gray-200'}`} 
            onClick={() => setViewMode('icons')}
            title="Iconos grandes">
            <Icon name="grid" size={ICON_24} />
          </button>
          <button 
            className={`p-1 mx-1 rounded ${viewMode === 'list' ? 'bg-blue-200' : 'hover:bg-gray-200'}`} 
            onClick={() => setViewMode('list')}
            title="Lista">
            <Icon name="list" size={ICON_24} />
          </button>
          <button 
            className={`p-1 mx-1 rounded ${viewMode === 'details' ? 'bg-blue-200' : 'hover:bg-gray-200'}`} 
            onClick={() => setViewMode('details')}
            title="Detalles">
            <Icon name="list-details" size={ICON_24} />
          </button>
        </div>
        
        {/* Address Bar */}
        <div className="p-1 bg-gray-50 border-b border-gray-300 flex items-center">
          <span className="text-sm font-medium mr-2">Dirección:</span>
          <div className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm">
            {currentPath}
          </div>
        </div>
        
        {/* File List Area */}
        <div className="flex-1 overflow-auto p-2">
          {/* Contenido dinámico basado en viewMode */}
          {viewMode === 'icons' && (
            <div className="grid grid-cols-6 gap-4">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-col items-center p-2 hover:bg-blue-100 rounded cursor-pointer">
                  <Icon name={entry.type === 'folder' ? 'folder' : 'file'} size={ICON_48} />
                  <span className="text-xs text-center truncate w-full">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="space-y-1">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center p-1 hover:bg-blue-100 rounded cursor-pointer">
                  <Icon name={entry.type === 'folder' ? 'folder' : 'file'} size={ICON_32} className="mr-2" />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === 'details' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-1">Nombre</th>
                  <th className="text-left p-1">Tamaño</th>
                  <th className="text-left p-1">Tipo</th>
                  <th className="text-left p-1">Modificado</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-blue-50">
                    <td className="p-1 flex items-center">
                      <Icon name={entry.type === 'folder' ? 'folder' : 'file'} size={ICON_16} className="mr-1" />
                      {entry.name}
                    </td>
                    <td className="p-1">{entry.size || '—'}</td>
                    <td className="p-1">{entry.type}</td>
                    <td className="p-1">{entry.modifiedAt?.toLocaleString() || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
