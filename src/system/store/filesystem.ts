import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimpleFileSystemAPI } from '../fs/simple-api';
import { MimeTypeManager } from '../fs/mime';
import { initializeDatabase } from '../fs/database';
import { FSEntry, FSEntryType, MimeType } from './types';

// Alias for consistency
const FileSystemAPI = SimpleFileSystemAPI;

interface FileSystemState {
  // State
  currentPath: string;
  selectedEntries: string[];
  clipboardEntries: { entries: FSEntry[]; operation: 'copy' | 'cut' } | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  currentEntries: any[];
  
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
  exportEntry: (id: string) => Promise<boolean>;
  
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
          // await seedFileSystem(); // Temporarily disabled
          
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
          const entries = await FileSystemAPI.getEntries(get().currentPath);
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
          const finalMimeType = (mimeType || MimeTypeManager.getMimeTypeFromExtension(name)) as MimeType;
          await FileSystemAPI.createFile(name, content, currentPath, finalMimeType);
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
            // TODO: Implement proper delete functionality
            console.log(`Delete entry ${id}, permanent: ${permanent}`);
          }
          
          await get().refresh();
          set({ selectedEntries: [] });
          return true;
        } catch (error) {
          console.error('Failed to delete entries:', error);
          set({ error: `Failed to delete entries` });
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
              // TODO: Implement proper copy functionality
              console.log(`Copy entry ${entry.id} to ${currentPath}`);
            } else {
              // TODO: Implement proper move functionality
              console.log(`Move entry ${entry.id} to ${currentPath}`);
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

      importFile: async (file: File) => {
        const { currentPath } = get();
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implement proper file import functionality
          console.log(`Import file ${file.name} to ${currentPath}`);
          await get().refresh();
          return true;
        } catch (error) {
          console.error('Failed to import file:', error);
          set({ error: `Failed to import ${file.name}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      exportEntry: async (id: string) => {
        try {
          // TODO: Implement proper export functionality
          console.log(`Export entry ${id}`);
          return true;
        } catch (error) {
          console.error('Failed to export entry:', error);
          return false;
        }
      },

      // Search
      searchEntries: async (query: string, type?: FSEntryType) => {
        try {
          // TODO: Implement proper search functionality
          console.log(`Search entries with query: ${query}, type: ${type}`);
          return [];
        } catch (error) {
          console.error('Failed to search entries:', error);
          return [];
        }
      },

      // Trash operations
      getTrashContents: async () => {
        try {
          // TODO: Implement proper trash functionality
          console.log('Get trash contents');
          return [];
        } catch (error) {
          console.error('Failed to get trash contents:', error);
          return [];
        }
      },

      restoreFromTrash: async (trashId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implement proper restore from trash functionality
          console.log(`Restore from trash: ${trashId}`);
          await get().refresh();
          return true;
        } catch (error) {
          console.error('Failed to restore from trash:', error);
          set({ error: 'Failed to restore item from trash' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      emptyTrash: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implement proper empty trash functionality
          console.log('Empty trash');
          return true;
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
