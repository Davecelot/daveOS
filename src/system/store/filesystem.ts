import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FSEntry, FSEntryType } from './types';
import { FileSystemAPI } from '../fs/api';
import { db, initializeDatabase } from '../fs/database';
import { seedFileSystem } from '../fs/seed';
import { MimeTypeManager } from '../fs/mime';

interface FileSystemState {
  // State
  currentPath: string;
  selectedEntries: string[];
  clipboardEntries: { entries: FSEntry[]; operation: 'copy' | 'cut' } | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  currentEntries: FSEntry[];
  
  // Actions
  initialize: () => Promise<void>;
  navigateTo: (path: string) => Promise<void>;
  navigateUp: () => Promise<void>;
  navigateHome: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Selection
  selectEntry: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
  
  // File operations
  createFolder: (name: string) => Promise<boolean>;
  createFile: (name: string, content?: string, mimeType?: string) => Promise<boolean>;
  renameEntry: (id: string, newName: string) => Promise<boolean>;
  deleteEntries: (ids: string[], permanent?: boolean) => Promise<boolean>;
  copyEntries: (ids: string[]) => void;
  cutEntries: (ids: string[]) => void;
  pasteEntries: () => Promise<boolean>;
  
  // Import/Export
  importFile: (file: File) => Promise<boolean>;
  exportEntry: (id: string) => Promise<void>;
  
  // Search
  searchEntries: (query: string, type?: FSEntryType) => Promise<FSEntry[]>;
  
  // Trash
  getTrashContents: () => Promise<any[]>;
  restoreFromTrash: (trashId: string) => Promise<boolean>;
  emptyTrash: () => Promise<boolean>;
}

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPath: '/home/user',
      selectedEntries: [],
      clipboardEntries: null,
      isLoading: false,
      error: null,
      currentEntries: [],

      // Initialize the file system
      initialize: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Initialize database
          const dbReady = await initializeDatabase();
          if (!dbReady) {
            throw new Error('Failed to initialize database');
          }

          // Seed file system if needed
          await seedFileSystem();
          
          // Initialize MIME associations
          await MimeTypeManager.initializeDefaultAssociations();
          
          // Load current directory
          await get().refresh();
          
          console.log('File system initialized successfully');
        } catch (error) {
          console.error('Failed to initialize file system:', error);
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Navigation
      navigateTo: async (path: string) => {
        set({ isLoading: true, error: null, selectedEntries: [] });
        
        try {
          const entries = await FileSystemAPI.getFolderContents(path);
          set({ 
            currentPath: path,
            currentEntries: entries,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to navigate to path:', error);
          set({ 
            error: `Failed to navigate to ${path}`,
            isLoading: false 
          });
        }
      },

      navigateUp: async () => {
        const { currentPath } = get();
        if (currentPath === '/') return;
        
        const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        await get().navigateTo(parentPath);
      },

      navigateHome: async () => {
        await get().navigateTo('/home/user');
      },

      refresh: async () => {
        const { currentPath } = get();
        await get().navigateTo(currentPath);
      },

      // Selection management
      selectEntry: (id: string) => {
        set({ selectedEntries: [id] });
      },

      selectMultiple: (ids: string[]) => {
        set({ selectedEntries: ids });
      },

      clearSelection: () => {
        set({ selectedEntries: [] });
      },

      toggleSelection: (id: string) => {
        const { selectedEntries } = get();
        const newSelection = selectedEntries.includes(id)
          ? selectedEntries.filter(entryId => entryId !== id)
          : [...selectedEntries, id];
        set({ selectedEntries: newSelection });
      },

      // File operations
      createFolder: async (name: string) => {
        const { currentPath } = get();
        set({ isLoading: true, error: null });
        
        try {
          await FileSystemAPI.createFolder(name, currentPath);
          await get().refresh();
          return true;
        } catch (error) {
          console.error('Failed to create folder:', error);
          set({ error: `Failed to create folder: ${name}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      createFile: async (name: string, content = '', mimeType?: string) => {
        const { currentPath } = get();
        set({ isLoading: true, error: null });
        
        try {
          const finalMimeType = mimeType || MimeTypeManager.getMimeTypeFromExtension(name);
          await FileSystemAPI.createFile(name, content, finalMimeType, currentPath);
          await get().refresh();
          return true;
        } catch (error) {
          console.error('Failed to create file:', error);
          set({ error: `Failed to create file: ${name}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      renameEntry: async (id: string, newName: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const success = await FileSystemAPI.renameEntry(id, newName);
          if (success) {
            await get().refresh();
            return true;
          } else {
            set({ error: 'Failed to rename entry' });
            return false;
          }
        } catch (error) {
          console.error('Failed to rename entry:', error);
          set({ error: `Failed to rename to: ${newName}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteEntries: async (ids: string[], permanent = false) => {
        set({ isLoading: true, error: null });
        
        try {
          for (const id of ids) {
            await FileSystemAPI.deleteEntry(id, !permanent);
          }
          
          await get().refresh();
          set({ selectedEntries: [] });
          return true;
        } catch (error) {
          console.error('Failed to delete entries:', error);
          set({ error: 'Failed to delete selected entries' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      copyEntries: (ids: string[]) => {
        const { currentEntries } = get();
        const entries = currentEntries.filter(entry => ids.includes(entry.id));
        set({ clipboardEntries: { entries, operation: 'copy' } });
      },

      cutEntries: (ids: string[]) => {
        const { currentEntries } = get();
        const entries = currentEntries.filter(entry => ids.includes(entry.id));
        set({ clipboardEntries: { entries, operation: 'cut' } });
      },

      pasteEntries: async () => {
        const { clipboardEntries, currentPath } = get();
        if (!clipboardEntries) return false;
        
        set({ isLoading: true, error: null });
        
        try {
          for (const entry of clipboardEntries.entries) {
            if (clipboardEntries.operation === 'copy') {
              // Create a copy
              await FileSystemAPI.createEntry({
                name: entry.name,
                type: entry.type,
                path: `${currentPath}/${entry.name}`,
                parent: null, // Will be resolved by API
                size: entry.size,
                mimeType: entry.mimeType,
                content: entry.content,
                metadata: entry.metadata
              });
            } else {
              // Move the entry
              await FileSystemAPI.moveEntry(entry.id, currentPath);
            }
          }
          
          if (clipboardEntries.operation === 'cut') {
            set({ clipboardEntries: null });
          }
          
          await get().refresh();
          return true;
        } catch (error) {
          console.error('Failed to paste entries:', error);
          set({ error: 'Failed to paste entries' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Import/Export
      importFile: async (file: File) => {
        const { currentPath } = get();
        set({ isLoading: true, error: null });
        
        try {
          const result = await FileSystemAPI.importEntry(file, currentPath);
          if (result) {
            await get().refresh();
            return true;
          } else {
            set({ error: 'Failed to import file' });
            return false;
          }
        } catch (error) {
          console.error('Failed to import file:', error);
          set({ error: `Failed to import: ${file.name}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      exportEntry: async (id: string) => {
        try {
          const blob = await FileSystemAPI.exportEntry(id);
          if (blob) {
            const entry = await FileSystemAPI.getEntry(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${entry?.name || 'export'}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error('Failed to export entry:', error);
          set({ error: 'Failed to export entry' });
        }
      },

      // Search
      searchEntries: async (query: string, type?: FSEntryType) => {
        try {
          return await FileSystemAPI.searchEntries(query, type);
        } catch (error) {
          console.error('Failed to search entries:', error);
          return [];
        }
      },

      // Trash operations
      getTrashContents: async () => {
        try {
          return await FileSystemAPI.getTrashContents();
        } catch (error) {
          console.error('Failed to get trash contents:', error);
          return [];
        }
      },

      restoreFromTrash: async (trashId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const success = await FileSystemAPI.restoreFromTrash(trashId);
          if (success) {
            await get().refresh();
            return true;
          } else {
            set({ error: 'Failed to restore from trash' });
            return false;
          }
        } catch (error) {
          console.error('Failed to restore from trash:', error);
          set({ error: 'Failed to restore from trash' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      emptyTrash: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const success = await FileSystemAPI.emptyTrash();
          if (success) {
            return true;
          } else {
            set({ error: 'Failed to empty trash' });
            return false;
          }
        } catch (error) {
          console.error('Failed to empty trash:', error);
          set({ error: 'Failed to empty trash' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'daveos-filesystem',
      partialize: (state) => ({
        currentPath: state.currentPath
      })
    }
  )
);
