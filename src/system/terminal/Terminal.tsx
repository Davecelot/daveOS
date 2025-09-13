import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { CommandProcessor } from './CommandProcessor';
import { useSimpleFileSystemStore } from '../store/simple-filesystem';

interface TerminalProps {
  windowId: string;
  onClose?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ windowId: _windowId, onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandProcessorRef = useRef<CommandProcessor | null>(null);
  
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  
  const { currentEntries } = useSimpleFileSystemStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
    const terminal = new XTerm({
      theme: {
        background: '#300A24',
        foreground: '#FFFFFF',
        cursor: '#FFFFFF',
        
        black: '#2E3436',
        red: '#CC0000',
        green: '#4E9A06',
        yellow: '#C4A000',
        blue: '#3465A4',
        magenta: '#75507B',
        cyan: '#06989A',
        white: '#D3D7CF',
        brightBlack: '#555753',
        brightRed: '#EF2929',
        brightGreen: '#8AE234',
        brightYellow: '#FCE94F',
        brightBlue: '#729FCF',
        brightMagenta: '#AD7FA8',
        brightCyan: '#34E2E2',
        brightWhite: '#EEEEEC'
      },
      fontFamily: 'Ubuntu Mono, Consolas, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    

    // Open terminal
    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Store references
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Initialize command processor
    commandProcessorRef.current = new CommandProcessor(
      currentPath,
      setCurrentPath,
      (output: string) => terminal.write(output)
    );

    // Welcome message
    terminal.writeln('\x1b[1;32m┌─────────────────────────────────────────┐\x1b[0m');
    terminal.writeln('\x1b[1;32m│           Welcome to daveOS            │\x1b[0m');
    terminal.writeln('\x1b[1;32m│         Ubuntu-style Terminal          │\x1b[0m');
    terminal.writeln('\x1b[1;32m└─────────────────────────────────────────┘\x1b[0m');
    terminal.writeln('');
    terminal.writeln('Type \x1b[1;33mhelp\x1b[0m to see available commands.');
    terminal.writeln('');

    // Show initial prompt
    showPrompt();

    // Handle input
    let currentInput = '';
    
    terminal.onData((data) => {
      const char = data.charCodeAt(0);
      
      if (char === 13) { // Enter
        terminal.writeln('');
        if (currentInput.trim()) {
          executeCommand(currentInput.trim());
          setCommandHistory(prev => [...prev, currentInput.trim()]);
          setHistoryIndex(-1);
        }
        currentInput = '';
      } else if (char === 127) { // Backspace
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          terminal.write('\b \b');
        }
      } else if (char === 27) { // Escape sequences
        // Handle arrow keys for history navigation
        if (data === '\x1b[A') { // Up arrow
          navigateHistory('up');
        } else if (data === '\x1b[B') { // Down arrow
          navigateHistory('down');
        }
      } else if (char === 9) { // Tab
        handleTabCompletion(currentInput);
      } else if (char >= 32 && char <= 126) { // Printable characters
        currentInput += data;
        terminal.write(data);
      }
    });

    function showPrompt() {
      const user = '\x1b[1;32muser\x1b[0m';
      const at = '\x1b[1;37m@\x1b[0m';
      const host = '\x1b[1;32mdaveos\x1b[0m';
      const colon = '\x1b[1;37m:\x1b[0m';
      const path = `\x1b[1;34m${currentPath}\x1b[0m`;
      const prompt = '\x1b[1;37m$ \x1b[0m';
      
      terminal.write(`${user}${at}${host}${colon}${path}${prompt}`);
    }

    function executeCommand(command: string) {
      if (commandProcessorRef.current) {
        commandProcessorRef.current.execute(command).then(() => {
          showPrompt();
        });
      }
    }

    function navigateHistory(direction: 'up' | 'down') {
      if (commandHistory.length === 0) return;

      let newIndex = historyIndex;
      
      if (direction === 'up') {
        newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      } else {
        newIndex = historyIndex === -1 ? -1 : Math.min(commandHistory.length - 1, historyIndex + 1);
      }

      if (newIndex !== historyIndex) {
        // Clear current input
        for (let i = 0; i < currentInput.length; i++) {
          terminal.write('\b \b');
        }

        // Set new command
        const newCommand = newIndex === -1 ? '' : commandHistory[newIndex];
        currentInput = newCommand;
        terminal.write(newCommand);
        setHistoryIndex(newIndex);
      }
    }

    function handleTabCompletion(input: string) {
      // Basic tab completion for commands and file names
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];
      
      if (parts.length === 1) {
        // Command completion
        const commands = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'help', 'clear', 'echo'];
        const matches = commands.filter(cmd => cmd.startsWith(lastPart));
        
        if (matches.length === 1) {
          const completion = matches[0].slice(lastPart.length);
          terminal.write(completion + ' ');
          currentInput += completion + ' ';
        }
      } else {
        // File/directory completion
        const entries = currentEntries.filter(entry => 
          entry.name.startsWith(lastPart)
        );
        
        if (entries.length === 1) {
          const completion = entries[0].name.slice(lastPart.length);
          terminal.write(completion);
          currentInput += completion;
        }
      }
    }

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, []);

  // Update command processor when path changes
  useEffect(() => {
    if (commandProcessorRef.current) {
      commandProcessorRef.current.setCurrentPath(currentPath);
    }
  }, [currentPath]);

  return (
    <div className="flex flex-col h-full bg-ubuntu-aubergine">
      <div className="flex items-center justify-between p-2 bg-ubuntu-aubergine border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-white text-sm font-medium">Terminal</span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 p-2"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
