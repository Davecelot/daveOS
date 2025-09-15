import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useTerminalStore } from '@/system/store/terminal';
import 'xterm/css/xterm.css';

export const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const { executeCommand, getHistoryItem, currentPath } = useTerminalStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      theme: {
        background: '#000000',
        foreground: '#C0C0C0',
        cursor: '#C0C0C0',
        cursorAccent: '#000000',
        selectionBackground: '#FFFFFF',
        black: '#000000',
        red: '#FF0000',
        green: '#00FF00',
        yellow: '#FFFF00',
        blue: '#0000FF',
        magenta: '#FF00FF',
        cyan: '#00FFFF',
        white: '#FFFFFF',
        brightBlack: '#808080',
        brightRed: '#FF8080',
        brightGreen: '#80FF80',
        brightYellow: '#FFFF80',
        brightBlue: '#8080FF',
        brightMagenta: '#FF80FF',
        brightCyan: '#80FFFF',
        brightWhite: '#FFFFFF'
      },
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 12,
      rows: 24,
      cols: 80,
      cursorBlink: true,
      cursorStyle: 'block'
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    // Welcome message
    term.writeln('Microsoft Windows XP [Version 5.1.2600]');
    term.writeln('(C) Copyright 1985-2001 Microsoft Corp.');
    term.writeln('');
    term.writeln('DaveOS Terminal Emulator');
    term.writeln('Type "help" for available commands.');
    term.writeln('');
    
    const writePrompt = () => {
      term.write(`\r\n${currentPath}>`);
    };
    
    writePrompt();

    // Handle input
    term.onData(async (data) => {
      const code = data.charCodeAt(0);
      
      if (code === 13) { // Enter
        if (currentInput.trim()) {
          term.writeln('');
          const result = await executeCommand(currentInput.trim());
          
          if (result === '\x1b[2J\x1b[H') { // Clear screen
            term.clear();
          } else if (result) {
            term.writeln(result);
          }
          
          setCurrentInput('');
          setHistoryIndex(-1);
        }
        writePrompt();
      } else if (code === 127 || code === 8) { // Backspace
        if (currentInput.length > 0) {
          setCurrentInput(prev => prev.slice(0, -1));
          term.write('\b \b');
        }
      } else if (code === 27) { // Escape sequences (arrow keys)
        // Handle arrow keys for history navigation
        return;
      } else if (code >= 32 && code <= 126) { // Printable characters
        setCurrentInput(prev => prev + data);
        term.write(data);
      }
    });

    // Handle arrow keys for command history
    term.onKey(({ domEvent }) => {
      if (domEvent.key === 'ArrowUp') {
        const historyItem = getHistoryItem(historyIndex + 1);
        if (historyItem) {
          // Clear current line
          term.write('\r' + ' '.repeat(currentPath.length + 1 + currentInput.length) + '\r');
          term.write(`${currentPath}>`);
          term.write(historyItem);
          setCurrentInput(historyItem);
          setHistoryIndex(prev => prev + 1);
        }
      } else if (domEvent.key === 'ArrowDown') {
        if (historyIndex > 0) {
          const historyItem = getHistoryItem(historyIndex - 1);
          if (historyItem) {
            // Clear current line
            term.write('\r' + ' '.repeat(currentPath.length + 1 + currentInput.length) + '\r');
            term.write(`${currentPath}>`);
            term.write(historyItem);
            setCurrentInput(historyItem);
            setHistoryIndex(prev => prev - 1);
          }
        } else {
          // Clear current line
          term.write('\r' + ' '.repeat(currentPath.length + 1 + currentInput.length) + '\r');
          term.write(`${currentPath}>`);
          setCurrentInput('');
          setHistoryIndex(-1);
        }
      }
    });

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Update prompt when current path changes
  useEffect(() => {
    if (xtermRef.current && currentInput === '') {
      // Only update if we're at a fresh prompt
      const term = xtermRef.current;
      term.write(`\r${currentPath}>`);
    }
  }, [currentPath, currentInput]);

  return (
    <div className="w-full h-full bg-black">
      <div 
        ref={terminalRef} 
        className="w-full h-full p-2"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
