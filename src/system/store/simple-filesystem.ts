import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimpleFileSystemAPI, SimpleEntry } from '../fs/simple-api';

interface SimpleFileSystemState {
  // State
  currentPath: string;
  currentEntries: SimpleEntry[];
  selectedEntries: string[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  navigationHistory: string[];
  historyIndex: number;
  
  // Actions
  initialize: () => Promise<void>;
  navigateTo: (path: string) => Promise<void>;
  navigateUp: () => Promise<void>;
  navigateHome: () => Promise<void>;
  refresh: () => Promise<void>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  
  // Selection
  selectEntry: (id: string) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
  
  // File operations
  createFolder: (name: string) => Promise<boolean>;
  createFile: (name: string, content?: string) => Promise<boolean>;
  renameEntry: (id: string, newName: string) => Promise<boolean>;
  deleteEntries: (ids: string[]) => Promise<boolean>;
}

export const useSimpleFileSystemStore = create<SimpleFileSystemState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPath: '/home/user',
      currentEntries: [],
      selectedEntries: [],
      isLoading: false,
      error: null,
      isInitialized: false,
      navigationHistory: ['/home/user'],
      historyIndex: 0,

      // Initialize the file system
      initialize: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const success = await SimpleFileSystemAPI.initialize();
          if (!success) {
            throw new Error('Failed to initialize filesystem');
          }

          set({ isInitialized: true });
          await get().navigateTo('/home/user');
          
          console.log('Simple filesystem initialized successfully');
        } catch (error) {
          console.error('Failed to initialize filesystem:', error);
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Navigation
      navigateTo: async (path: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const entries = await SimpleFileSystemAPI.getEntries(path);
          const { navigationHistory, historyIndex } = get();
          
          // Update navigation history
          const newHistory = [...navigationHistory.slice(0, historyIndex + 1), path];
          
          set({ 
            currentPath: path,
            currentEntries: entries,
            selectedEntries: [],
            isLoading: false,
            navigationHistory: newHistory,
            historyIndex: newHistory.length - 1
          });
        } catch (error) {
          console.error('Failed to navigate:', error);
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

      goBack: async () => {
        const { navigationHistory, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const path = navigationHistory[newIndex];
          set({ historyIndex: newIndex });
          await get().navigateTo(path);
        }
      },

      goForward: async () => {
        const { navigationHistory, historyIndex } = get();
        if (historyIndex < navigationHistory.length - 1) {
          const newIndex = historyIndex + 1;
          const path = navigationHistory[newIndex];
          set({ historyIndex: newIndex });
          await get().navigateTo(path);
        }
      },

      // Selection management
      selectEntry: (id: string) => {
        set({ selectedEntries: [id] });
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
          const success = await SimpleFileSystemAPI.createFolder(name, currentPath);
          if (success) {
            await get().refresh();
            return true;
          } else {
            set({ error: `Failed to create folder: ${name}` });
            return false;
          }
        } catch (error) {
          console.error('Failed to create folder:', error);
          set({ error: `Failed to create folder: ${name}` });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      createFile: async (name: string, content = '') => {
        const { currentPath } = get();
        set({ isLoading: true, error: null });
        
        try {
          const success = await SimpleFileSystemAPI.createFile(name, content, currentPath);
          if (success) {
            await get().refresh();
            return true;
          } else {
            set({ error: `Failed to create file: ${name}` });
            return false;
          }
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
          const success = await SimpleFileSystemAPI.renameEntry(id, newName);
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

      deleteEntries: async (ids: string[]) => {
        set({ isLoading: true, error: null });
        
        try {
          for (const id of ids) {
            await SimpleFileSystemAPI.deleteEntry(id);
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
      }
    }),
    {
      name: 'daveos-simple-filesystem',
      partialize: (state) => ({
        currentPath: state.currentPath,
        isInitialized: state.isInitialized
      })
    }
  )
);
