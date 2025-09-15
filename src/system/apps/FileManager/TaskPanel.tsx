import React from 'react';
import { Icon, ICON_16 } from '@/system/ui/Icon';

type SelectionType = 'none' | 'file' | 'folder' | 'multiple';

interface TaskPanelProps {
  selectionType: SelectionType;
  onNewFolder: () => void;
  onNewFile: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onRename: () => void;
  onProperties: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  selectionType,
  onNewFolder,
  onNewFile,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onRename,
  onProperties
}) => {
  return (
    <div className="w-48 p-2 bg-gray-50 border-r border-gray-300">
      <div className="text-xs font-bold text-gray-600 mb-2">
        {selectionType === 'none' ? 'Tareas del sistema' : 
         selectionType === 'file' ? 'Tareas para archivos' : 
         selectionType === 'folder' ? 'Tareas para carpetas' : 
         'Tareas para elementos'}
      </div>
      
      <div className="space-y-1">
        {selectionType === 'none' && (
          <>
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onNewFolder}
            >
              <Icon name="new-folder" size={ICON_16} className="mr-2" />
              <span>Nueva carpeta</span>
            </button>
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onNewFile}
            >
              <Icon name="new-file" size={ICON_16} className="mr-2" />
              <span>Nuevo archivo</span>
            </button>
          </>
        )}
        
        {selectionType !== 'none' && (
          <>
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onCut}
            >
              <Icon name="cut" size={ICON_16} className="mr-2" />
              <span>Cortar</span>
            </button>
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onCopy}
            >
              <Icon name="copy" size={ICON_16} className="mr-2" />
              <span>Copiar</span>
            </button>
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onPaste}
            >
              <Icon name="paste" size={ICON_16} className="mr-2" />
              <span>Pegar</span>
            </button>
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onDelete}
            >
              <Icon name="trash" size={ICON_16} className="mr-2" />
              <span>Eliminar</span>
            </button>
            {selectionType !== 'multiple' && (
              <button 
                className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
                onClick={onRename}
              >
                <Icon name="edit" size={ICON_16} className="mr-2" />
                <span>Renombrar</span>
              </button>
            )}
            <button 
              className="w-full text-left flex items-center p-1 hover:bg-blue-100 rounded"
              onClick={onProperties}
            >
              <Icon name="settings" size={ICON_16} className="mr-2" />
              <span>Propiedades</span>
            </button>
          </>
        )}
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
  );
};
