import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  RefreshCw,
  Search,
  Grid,
  List,
  Trash2,
  Copy,
  Scissors,
  FolderPlus,
  FilePlus
} from 'lucide-react';
import { useSimpleFileSystemStore } from '../store/simple-filesystem';
import { FSEntryType } from '../store/types';

interface FileManagerProps {
  windowId?: string;
  onClose?: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ onClose: _onClose }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [, setClipboard] = useState<{items: any[], operation: 'copy' | 'cut'} | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<{x: number, y: number, item?: any} | null>(null);
  
  const {
    currentPath,
    currentEntries,
    navigationHistory,
    historyIndex,
    navigateTo,
    goBack,
    goForward,
    createFolder,
    createFile,
    deleteEntries,
    refresh
  } = useSimpleFileSystemStore();

  useEffect(() => {
    // Close context menu when clicking outside
    const handleClick = () => setShowContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const filteredEntries = currentEntries.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = async (item: any) => {
    if (item.type === FSEntryType.FOLDER) {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      await navigateTo(newPath);
    } else {
      // Open file with appropriate app
      console.log('Opening file:', item.name);
    }
  };

  const handleItemSelect = (itemId: string, isCtrlClick: boolean = false) => {
    if (isCtrlClick) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      setSelectedItems(newSelected);
    } else {
      setSelectedItems(new Set([itemId]));
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item?: any) => {
    e.preventDefault();
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleNewFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name) {
      await createFolder(name);
    }
    setShowContextMenu(null);
  };

  const handleNewFile = async () => {
    const name = prompt('Enter file name:');
    if (name) {
      await createFile(name, '');
    }
    setShowContextMenu(null);
  };

  const handleCopy = () => {
    const items = currentEntries.filter(entry => selectedItems.has(entry.id!.toString()));
    setClipboard({ items, operation: 'copy' });
    setShowContextMenu(null);
  };

  const handleCut = () => {
    const items = currentEntries.filter(entry => selectedItems.has(entry.id!.toString()));
    setClipboard({ items, operation: 'cut' });
    setShowContextMenu(null);
  };

  const handleDelete = async () => {
    if (selectedItems.size > 0 && confirm('Delete selected items?')) {
      await deleteEntries(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
    setShowContextMenu(null);
  };

  const getFileIcon = (entry: any) => {
    if (entry.type === FSEntryType.FOLDER) {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    
    const ext = entry.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt':
      case 'md':
        return <File className="w-5 h-5 text-gray-600" />;
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
        return <File className="w-5 h-5 text-yellow-600" />;
      case 'css':
        return <File className="w-5 h-5 text-blue-600" />;
      case 'html':
        return <File className="w-5 h-5 text-orange-600" />;
      case 'json':
        return <File className="w-5 h-5 text-green-600" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goForward}
            disabled={historyIndex >= navigationHistory.length - 1}
            className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateTo(currentPath.substring(0, currentPath.lastIndexOf('/')) || '/')}
            disabled={currentPath === '/'}
            className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            title="Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateTo('/home/user')}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
          
          <button
            onClick={refresh}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Address Bar */}
      <div className="flex items-center p-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-600 mr-2">📁</span>
        <span className="text-sm font-mono">{currentPath}</span>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-2">
        {viewMode === 'list' ? (
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 p-2 text-xs font-medium text-gray-600 border-b border-gray-200">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Modified</div>
            </div>
            
            {/* Items */}
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`grid grid-cols-12 gap-2 p-2 text-sm hover:bg-gray-100 cursor-pointer rounded ${
                  selectedItems.has(entry.id!.toString()) ? 'bg-blue-100' : ''
                }`}
                onClick={(e) => {
                  if (e.detail === 2) {
                    handleItemClick(entry);
                  } else {
                    handleItemSelect(entry.id!.toString(), e.ctrlKey);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, entry)}
              >
                <div className="col-span-6 flex items-center space-x-2">
                  {getFileIcon(entry)}
                  <span className="truncate">{entry.name}</span>
                </div>
                <div className="col-span-2 text-gray-600">
                  {entry.type === FSEntryType.FILE ? formatFileSize(entry.size) : '—'}
                </div>
                <div className="col-span-2 text-gray-600">
                  {entry.type === FSEntryType.FOLDER ? 'Folder' : 'File'}
                </div>
                <div className="col-span-2 text-gray-600">
                  {formatDate(entry.modifiedAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  selectedItems.has(entry.id!.toString()) ? 'bg-blue-100 border-blue-300' : ''
                }`}
                onClick={(e) => {
                  if (e.detail === 2) {
                    handleItemClick(entry);
                  } else {
                    handleItemSelect(entry.id!.toString(), e.ctrlKey);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, entry)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-3xl">
                    {getFileIcon(entry)}
                  </div>
                  <span className="text-sm text-center truncate w-full">{entry.name}</span>
                  {entry.type === FSEntryType.FILE && (
                    <span className="text-xs text-gray-500">{formatFileSize(entry.size)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Folder className="w-16 h-16 mb-4" />
            <p>This folder is empty</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
        <span>{filteredEntries.length} items</span>
        {selectedItems.size > 0 && (
          <span>{selectedItems.size} selected</span>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white border border-gray-300 rounded shadow-lg py-1 z-50"
          style={{
            left: showContextMenu.x,
            top: showContextMenu.y
          }}
        >
          {!showContextMenu.item ? (
            // Background context menu
            <>
              <button
                onClick={handleNewFolder}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Folder</span>
              </button>
              <button
                onClick={handleNewFile}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>New File</span>
              </button>
            </>
          ) : (
            // Item context menu
            <>
              <button
                onClick={handleCopy}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleCut}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Scissors className="w-4 h-4" />
                <span>Cut</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={handleDelete}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
