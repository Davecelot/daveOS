import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Maximize, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Info,
  X
} from 'lucide-react';
import { useSimpleFileSystemStore } from '../store/simple-filesystem';
import { FSEntryType } from '../store/types';

interface ImageViewerProps {
  windowId?: string;
  imagePath?: string;
  onClose?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imagePath, onClose: _onClose }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageList, setImageList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<any>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { navigateTo, currentEntries } = useSimpleFileSystemStore();

  // Supported image formats
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

  useEffect(() => {
    if (imagePath) {
      loadImage(imagePath);
    } else {
      loadImagesFromCurrentDirectory();
    }
  }, [imagePath]);

  const loadImage = async (path: string) => {
    try {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const fileName = path.substring(path.lastIndexOf('/') + 1);
      
      await navigateTo(parentPath);
      loadImagesFromCurrentDirectory();
      
      // Find the image in the list and set as current
      const entries = useSimpleFileSystemStore.getState().currentEntries;
      const imageFiles = entries.filter(entry => 
        entry.type === FSEntryType.FILE && 
        isImageFile(entry.name)
      );
      
      const imageIndex = imageFiles.findIndex(img => img.name === fileName);
      if (imageIndex !== -1) {
        setCurrentIndex(imageIndex);
        setCurrentImage(createImageUrl(imageFiles[imageIndex]));
        setImageMetadata(imageFiles[imageIndex]);
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const loadImagesFromCurrentDirectory = () => {
    const entries = useSimpleFileSystemStore.getState().currentEntries;
    const imageFiles = entries.filter(entry => 
      entry.type === FSEntryType.FILE && 
      isImageFile(entry.name)
    );
    
    setImageList(imageFiles);
    
    if (imageFiles.length > 0 && !currentImage) {
      setCurrentIndex(0);
      setCurrentImage(createImageUrl(imageFiles[0]));
      setImageMetadata(imageFiles[0]);
    }
  };

  const isImageFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext ? imageExtensions.includes(ext) : false;
  };

  const createImageUrl = (imageFile: any): string => {
    // For demo purposes, we'll use placeholder images
    // In a real implementation, this would create a blob URL from file content
    const placeholders = [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=4',
      'https://picsum.photos/800/600?random=5'
    ];
    
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (imageList.length === 0) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : imageList.length - 1;
    } else {
      newIndex = currentIndex < imageList.length - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentIndex(newIndex);
    setCurrentImage(createImageUrl(imageList[newIndex]));
    setImageMetadata(imageList[newIndex]);
    resetView();
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(10, Math.min(500, zoom + delta));
    setZoom(newZoom);
  };

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const fitToWindow = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    
    const scaleX = (container.width - 40) / image.naturalWidth;
    const scaleY = (container.height - 40) / image.naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    setZoom(Math.round(scale * 100));
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        navigateImage('prev');
        break;
      case 'ArrowRight':
        navigateImage('next');
        break;
      case '+':
      case '=':
        handleZoom(25);
        break;
      case '-':
        handleZoom(-25);
        break;
      case '0':
        resetView();
        break;
      case 'f':
        fitToWindow();
        break;
      case 'i':
        setShowInfo(!showInfo);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoom, currentIndex, showInfo]);

  const formatFileSize = (size?: number) => {
    if (!size) return 'Unknown';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!currentImage) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium mb-2">No images found</h3>
          <p className="text-gray-400">Navigate to a folder with images to view them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {imageMetadata?.name} ({currentIndex + 1} of {imageList.length})
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => navigateImage('prev')}
            disabled={imageList.length <= 1}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateImage('next')}
            disabled={imageList.length <= 1}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-gray-600 mx-1" />
          
          <button
            onClick={() => handleZoom(-25)}
            className="p-1 text-gray-400 hover:text-white"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs px-2 py-1 bg-gray-700 rounded min-w-[60px] text-center">
            {zoom}%
          </span>
          
          <button
            onClick={() => handleZoom(25)}
            className="p-1 text-gray-400 hover:text-white"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={fitToWindow}
            className="p-1 text-gray-400 hover:text-white"
            title="Fit to Window (F)"
          >
            <Maximize className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetView}
            className="p-1 text-gray-400 hover:text-white"
            title="Reset View (0)"
          >
            <Home className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-gray-600 mx-1" />
          
          <button
            onClick={() => handleRotate(-90)}
            className="p-1 text-gray-400 hover:text-white"
            title="Rotate Left"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleRotate(90)}
            className="p-1 text-gray-400 hover:text-white"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-gray-600 mx-1" />
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1 hover:text-white ${showInfo ? 'text-blue-400' : 'text-gray-400'}`}
            title="Image Info (I)"
          >
            <Info className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              // Download functionality would be implemented here
              console.log('Download image:', imageMetadata?.name);
            }}
            className="p-1 text-gray-400 hover:text-white"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center justify-center h-full">
          <img
            ref={imageRef}
            src={currentImage}
            alt={imageMetadata?.name}
            className="max-w-none transition-transform duration-200"
            style={{
              transform: `
                translate(${imagePosition.x}px, ${imagePosition.y}px) 
                scale(${zoom / 100}) 
                rotate(${rotation}deg)
              `,
              cursor: zoom > 100 ? 'grab' : 'default'
            }}
            onLoad={() => {
              if (zoom === 100) {
                fitToWindow();
              }
            }}
            draggable={false}
          />
        </div>
        
        {/* Navigation Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Image Info Panel */}
      {showInfo && imageMetadata && (
        <div className="absolute top-16 right-4 bg-black bg-opacity-90 rounded-lg p-4 min-w-[250px] max-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Image Information</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <div className="break-all">{imageMetadata.name}</div>
            </div>
            
            <div>
              <span className="text-gray-400">Size:</span>
              <div>{formatFileSize(imageMetadata.size)}</div>
            </div>
            
            <div>
              <span className="text-gray-400">Modified:</span>
              <div>{imageMetadata.modifiedAt?.toLocaleDateString()}</div>
            </div>
            
            <div>
              <span className="text-gray-400">Type:</span>
              <div>{imageMetadata.name.split('.').pop()?.toUpperCase()}</div>
            </div>
            
            <div>
              <span className="text-gray-400">Zoom:</span>
              <div>{zoom}%</div>
            </div>
            
            <div>
              <span className="text-gray-400">Rotation:</span>
              <div>{rotation}°</div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        <div>← → Navigate • + - Zoom • 0 Reset • F Fit • I Info</div>
      </div>
    </div>
  );
};
