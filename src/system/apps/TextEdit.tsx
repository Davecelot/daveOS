import React, { useState, useEffect, useRef } from 'react';
import { Save, FileText, Undo, Redo, Search, Replace } from 'lucide-react';
import { useSimpleFileSystemStore } from '../store/simple-filesystem';
import { FSEntryType } from '../store/types';

interface TextEditProps {
  windowId?: string;
  filePath?: string;
  onClose?: () => void;
}

export const TextEdit: React.FC<TextEditProps> = ({ windowId, filePath, onClose }) => {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled.txt');
  const [isModified, setIsModified] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(filePath || '');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createFile, navigateTo, currentEntries } = useSimpleFileSystemStore();

  // Load file content if filePath is provided
  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
    }
  }, [filePath]);

  const loadFile = async (path: string) => {
    try {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const name = path.substring(path.lastIndexOf('/') + 1);
      
      await navigateTo(parentPath);
      const entries = useSimpleFileSystemStore.getState().currentEntries;
      const file = entries.find(entry => entry.name === name && entry.type === FSEntryType.FILE);
      
      if (file && file.content) {
        setContent(file.content);
        setFileName(name);
        setCurrentFilePath(path);
        setIsModified(false);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  };

  const saveFile = async () => {
    try {
      if (currentFilePath) {
        // Update existing file
        const parentPath = currentFilePath.substring(0, currentFilePath.lastIndexOf('/')) || '/';
        await navigateTo(parentPath);
        
        // For now, we'll create a new file with the same name (simple implementation)
        const success = await createFile(fileName, content);
        if (success) {
          setIsModified(false);
        }
      } else {
        // Save as new file
        const success = await createFile(fileName, content);
        if (success) {
          setCurrentFilePath(`/home/user/${fileName}`);
          setIsModified(false);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const saveAsFile = () => {
    const newName = prompt('Enter file name:', fileName);
    if (newName) {
      setFileName(newName);
      setCurrentFilePath('');
      saveFile();
    }
  };

  const newFile = () => {
    if (isModified) {
      const shouldSave = confirm('Save changes to current file?');
      if (shouldSave) {
        saveFile();
      }
    }
    setContent('');
    setFileName('Untitled.txt');
    setCurrentFilePath('');
    setIsModified(false);
  };

  const insertText = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      setIsModified(true);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const findAndReplace = () => {
    if (findText && replaceText) {
      const newContent = content.replaceAll(findText, replaceText);
      setContent(newContent);
      setIsModified(true);
    }
  };

  const getLineNumbers = () => {
    const lines = content.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
    // Ctrl+N for new file
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      newFile();
    }
    // Ctrl+F for find
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setShowFindReplace(!showFindReplace);
    }
    // Tab insertion
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  '); // 2 spaces for tab
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Menu Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-sm">
            {fileName}{isModified ? ' *' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={newFile}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="New File (Ctrl+N)"
          >
            <FileText className="w-4 h-4" />
          </button>
          
          <button
            onClick={saveFile}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Find & Replace (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-gray-300 mx-1" />
          
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="text-xs border border-gray-300 rounded px-1"
          >
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
          </select>
          
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="mr-1"
            />
            Wrap
          </label>
          
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="mr-1"
            />
            Lines
          </label>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <div className="flex items-center space-x-2 p-2 bg-yellow-50 border-b border-yellow-200">
          <input
            type="text"
            placeholder="Find..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Replace..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <button
            onClick={findAndReplace}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Replace All
          </button>
          <button
            onClick={() => setShowFindReplace(false)}
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className="bg-gray-50 border-r border-gray-300 px-2 py-2 text-right text-gray-500 font-mono text-sm select-none">
            <pre style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}>
              {getLineNumbers()}
            </pre>
          </div>
        )}
        
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border-none outline-none resize-none font-mono"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            wordWrap: wordWrap ? 'break-word' : 'normal',
            overflowWrap: wordWrap ? 'break-word' : 'normal'
          }}
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Lines: {content.split('\n').length}</span>
          <span>Characters: {content.length}</span>
          <span>Words: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentFilePath && <span>📁 {currentFilePath}</span>}
          <span>{isModified ? 'Modified' : 'Saved'}</span>
        </div>
      </div>
    </div>
  );
};
