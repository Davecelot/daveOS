import { create } from 'zustand';
import { useSimpleFileSystemStore } from './simple-filesystem';

interface ClipboardEntry {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
}

interface ClipboardState {
  operation: 'copy' | 'cut' | null;
  entries: ClipboardEntry[];
  sourcePath: string;
  
  copy: (entries: ClipboardEntry[], sourcePath: string) => void;
  cut: (entries: ClipboardEntry[], sourcePath: string) => void;
  clear: () => void;
  paste: () => Promise<void>;
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  operation: null,
  entries: [],
  sourcePath: '',
  
  copy: (entries, sourcePath) => {
    set({ operation: 'copy', entries, sourcePath });
  },
  
  cut: (entries, sourcePath) => {
    set({ operation: 'cut', entries, sourcePath });
  },
  
  clear: () => {
    set({ operation: null, entries: [], sourcePath: '' });
  },
  
  paste: async () => {
    const { operation, entries, sourcePath } = get();
    if (!operation || entries.length === 0) return;
    
    // Obtener el directorio destino actual
    const targetPath = useSimpleFileSystemStore.getState().currentPath;
    
    // Lógica para copiar o mover archivos
    // (Se implementará en el siguiente paso)
    console.log(`Operación ${operation} desde ${sourcePath} a ${targetPath}`);
    
    // Limpiar el portapapeles después de pegar
    get().clear();
  }
}));
