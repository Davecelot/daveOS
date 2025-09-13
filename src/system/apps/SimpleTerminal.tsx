import React, { useState, useRef, useEffect } from 'react';
import { useSimpleFileSystemStore } from '../store/simple-filesystem';
import { FSEntryType } from '../store/types';

interface SimpleTerminalProps {
  windowId?: string;
  onClose?: () => void;
}

export const SimpleTerminal: React.FC<SimpleTerminalProps> = ({ onClose: _onClose }) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [output, setOutput] = useState<string[]>([
    '┌─────────────────────────────────────────┐',
    '│           Welcome to daveOS            │',
    '│         Ubuntu-style Terminal          │',
    '└─────────────────────────────────────────┘',
    '',
    'Type "help" to see available commands.',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addOutput = (text: string) => {
    setOutput(prev => [...prev, text]);
  };

  const getPrompt = () => {
    return `user@daveos:${currentPath}$ `;
  };

  const executeCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Add command to output
    addOutput(getPrompt() + trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          addOutput('Available Commands:');
          addOutput('');
          addOutput('File System:');
          addOutput('  ls [path]     - List directory contents');
          addOutput('  cd <path>     - Change directory');
          addOutput('  pwd           - Print working directory');
          addOutput('  cat <file>    - Display file contents');
          addOutput('  mkdir <name>  - Create directory');
          addOutput('  touch <name>  - Create empty file');
          addOutput('  rm <name>     - Remove file or directory');
          addOutput('');
          addOutput('System:');
          addOutput('  clear         - Clear terminal screen');
          addOutput('  echo <text>   - Display text');
          addOutput('  whoami        - Display current user');
          addOutput('  date          - Display current date and time');
          addOutput('  help          - Show this help message');
          break;

        case 'ls':
          await handleLs(args);
          break;

        case 'cd':
          await handleCd(args);
          break;

        case 'pwd':
          addOutput(currentPath);
          break;

        case 'clear':
          setOutput([]);
          break;

        case 'echo':
          addOutput(args.join(' '));
          break;

        case 'whoami':
          addOutput('user');
          break;

        case 'date':
          addOutput(new Date().toString());
          break;

        case 'cat':
          await handleCat(args);
          break;

        case 'mkdir':
          await handleMkdir(args);
          break;

        case 'touch':
          await handleTouch(args);
          break;

        case 'rm':
          await handleRm(args);
          break;

        default:
          addOutput(`Command not found: ${cmd}`);
          addOutput('Type "help" to see available commands.');
      }
    } catch (error) {
      addOutput(`Error: ${(error as Error).message}`);
    }

    addOutput('');
  };

  const handleLs = async (args: string[]) => {
    const targetPath = args.length > 0 ? resolvePath(args[0]) : currentPath;
    
    try {
      await useSimpleFileSystemStore.getState().navigateTo(targetPath);
      const currentEntries = useSimpleFileSystemStore.getState().currentEntries;
      
      if (currentEntries.length === 0) {
        return;
      }

      const sorted = currentEntries.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === FSEntryType.FOLDER ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      for (const entry of sorted) {
        const icon = entry.type === FSEntryType.FOLDER ? '📁' : '📄';
        const suffix = entry.type === FSEntryType.FOLDER ? '/' : '';
        addOutput(`${icon} ${entry.name}${suffix}`);
      }
    } catch (error) {
      addOutput(`ls: cannot access '${targetPath}': No such file or directory`);
    }
  };

  const handleCd = async (args: string[]) => {
    if (args.length === 0) {
      setCurrentPath('/home/user');
      return;
    }

    const targetPath = resolvePath(args[0]);
    
    try {
      await useSimpleFileSystemStore.getState().navigateTo(targetPath);
      setCurrentPath(targetPath);
    } catch (error) {
      addOutput(`cd: ${targetPath}: No such file or directory`);
    }
  };

  const handleCat = async (args: string[]) => {
    if (args.length === 0) {
      addOutput('cat: missing file operand');
      return;
    }

    const filePath = resolvePath(args[0]);
    const parentPath = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    
    try {
      await useSimpleFileSystemStore.getState().navigateTo(parentPath);
      const entries = useSimpleFileSystemStore.getState().currentEntries;
      const file = entries.find(entry => entry.name === fileName && entry.type === FSEntryType.FILE);
      
      if (!file) {
        addOutput(`cat: ${filePath}: No such file or directory`);
        return;
      }

      if (file.content) {
        const lines = file.content.split('\n');
        lines.forEach(line => addOutput(line));
      }
    } catch (error) {
      addOutput(`cat: ${filePath}: No such file or directory`);
    }
  };

  const handleMkdir = async (args: string[]) => {
    if (args.length === 0) {
      addOutput('mkdir: missing operand');
      return;
    }

    const success = await useSimpleFileSystemStore.getState().createFolder(args[0]);
    if (!success) {
      addOutput(`mkdir: cannot create directory '${args[0]}'`);
    }
  };

  const handleTouch = async (args: string[]) => {
    if (args.length === 0) {
      addOutput('touch: missing file operand');
      return;
    }

    const success = await useSimpleFileSystemStore.getState().createFile(args[0], '');
    if (!success) {
      addOutput(`touch: cannot create file '${args[0]}'`);
    }
  };

  const handleRm = async (args: string[]) => {
    if (args.length === 0) {
      addOutput('rm: missing operand');
      return;
    }

    const entries = useSimpleFileSystemStore.getState().currentEntries;
    const target = entries.find(entry => entry.name === args[0]);
    
    if (!target) {
      addOutput(`rm: cannot remove '${args[0]}': No such file or directory`);
      return;
    }

    const success = await useSimpleFileSystemStore.getState().deleteEntries([target.id!.toString()]);
    if (!success) {
      addOutput(`rm: cannot remove '${args[0]}'`);
    }
  };

  const resolvePath = (path: string): string => {
    if (path.startsWith('/')) {
      return path;
    }
    
    if (path === '..') {
      const parts = currentPath.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }
    
    if (path === '.') {
      return currentPath;
    }
    
    return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        if (newIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-green-400 font-mono text-sm">
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-white text-sm font-medium">Terminal</span>
        <button
          onClick={_onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div
        ref={outputRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{ minHeight: '300px' }}
      >
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        
        <div className="flex items-center">
          <span className="text-green-400">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
