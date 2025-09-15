import { create } from 'zustand';
import { useSimpleFileSystemStore } from './simple-filesystem';
import { SimpleFileSystemAPI } from '@/system/fs/simple-api';

interface TerminalState {
  currentPath: string;
  history: string[];
  historyIndex: number;
  
  executeCommand: (command: string) => Promise<string>;
  addToHistory: (command: string) => void;
  getHistoryItem: (index: number) => string | undefined;
  setCurrentPath: (path: string) => void;
}

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${Math.round(size / (1024 * 1024))} MB`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: '2-digit',
    month: '2-digit', 
    day: '2-digit'
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const useTerminalStore = create<TerminalState>((set, get) => ({
  currentPath: '/home/user',
  history: [],
  historyIndex: -1,
  
  executeCommand: async (command: string): Promise<string> => {
    const trimmed = command.trim();
    if (!trimmed) return '';
    
    get().addToHistory(trimmed);
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
      case 'ver':
        return `daveOS XP Mode [Version 1.0.0]
(c) 2024 DaveOS Corporation. All rights reserved.

   ▄▄▄▄▄   ▄▄▄  ▄   ▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄
   █   █ █▄▄▄█ █   █ █▄▄▄▄ █   █ █▄▄▄▄
   █   █ █▄▄▄█  █▄█  █▄▄▄▄ █   █ █▄▄▄▄
   █▄▄▄█ █   █   █   █▄▄▄█ █▄▄▄█ █▄▄▄█

WebOS with Windows XP Luna UI - Built with React & TypeScript`;

      case 'dir':
        try {
          const { currentPath } = get();
          const entries = await SimpleFileSystemAPI.getEntries(currentPath);
          
          let output = `\n Directory of ${currentPath}\n\n`;
          
          let totalFiles = 0;
          let totalDirs = 0;
          let totalSize = 0;
          
          for (const entry of entries) {
            const date = formatDate(entry.modifiedAt || new Date());
            const size = entry.type === 'folder' ? '<DIR>' : formatFileSize(entry.size);
            const name = entry.name;
            
            output += `${date}    ${size.padStart(12)}  ${name}\n`;
            
            if (entry.type === 'folder') {
              totalDirs++;
            } else {
              totalFiles++;
              totalSize += entry.size;
            }
          }
          
          output += `\n               ${totalFiles} File(s)    ${formatFileSize(totalSize)}\n`;
          output += `               ${totalDirs} Dir(s)\n`;
          
          return output;
        } catch (error) {
          return `Error: Cannot access directory ${get().currentPath}`;
        }

      case 'cd':
        if (args.length === 0) {
          return get().currentPath;
        }
        
        const targetPath = args[0];
        try {
          if (targetPath === '..') {
            const current = get().currentPath;
            if (current === '/') return 'Already at root directory';
            const parent = current.substring(0, current.lastIndexOf('/')) || '/';
            set({ currentPath: parent });
            useSimpleFileSystemStore.getState().navigateTo(parent);
            return '';
          } else if (targetPath === '/') {
            set({ currentPath: '/' });
            useSimpleFileSystemStore.getState().navigateTo('/');
            return '';
          } else {
            const newPath = get().currentPath === '/' ? `/${targetPath}` : `${get().currentPath}/${targetPath}`;
            const entry = await SimpleFileSystemAPI.getEntryByPath(newPath);
            
            if (!entry) {
              return `The system cannot find the path specified: ${targetPath}`;
            }
            
            if (entry.type !== 'folder') {
              return `${targetPath} is not a directory`;
            }
            
            set({ currentPath: newPath });
            useSimpleFileSystemStore.getState().navigateTo(newPath);
            return '';
          }
        } catch (error) {
          return `Error changing directory: ${error}`;
        }

      case 'type':
        if (args.length === 0) {
          return 'The syntax of the command is incorrect.\nUsage: TYPE filename';
        }
        
        try {
          const filename = args[0];
          const filePath = get().currentPath === '/' ? `/${filename}` : `${get().currentPath}/${filename}`;
          const entry = await SimpleFileSystemAPI.getEntryByPath(filePath);
          
          if (!entry) {
            return `The system cannot find the file specified: ${filename}`;
          }
          
          if (entry.type === 'folder') {
            return `${filename} is a directory`;
          }
          
          return entry.content || '(empty file)';
        } catch (error) {
          return `Error reading file: ${error}`;
        }

      case 'cls':
        return '\x1b[2J\x1b[H'; // ANSI clear screen

      case 'help':
        return `Available commands:

DIR                 Lists files and folders in current directory
CD [path]           Changes current directory
TYPE filename       Displays contents of a text file
CLS                 Clears the screen  
VER                 Shows system version
HELP               Shows this help message
EXIT               Closes the terminal

For more information on a specific command, type HELP command-name`;

      case 'exit':
        return 'Terminal session ended.';

      default:
        return `'${cmd}' is not recognized as an internal or external command,
operable program or batch file.`;
    }
  },
  
  addToHistory: (command: string) => {
    set(state => ({
      history: [...state.history, command],
      historyIndex: -1
    }));
  },
  
  getHistoryItem: (index: number): string | undefined => {
    const { history } = get();
    if (index >= 0 && index < history.length) {
      return history[history.length - 1 - index];
    }
    return undefined;
  },
  
  setCurrentPath: (path: string) => {
    set({ currentPath: path });
  }
}));
