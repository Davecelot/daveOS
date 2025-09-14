import type { IconName } from '@/system/ui/icons';

// Map file extensions to IconName
export function extToIconName(filename: string): IconName {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'txt':
    case 'md':
    case 'log':
    case 'ini':
      return 'text';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
      return 'image';
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return 'audio';
    case 'mp4':
    case 'webm':
    case 'avi':
    case 'mov':
      return 'video';
    case 'pdf':
      return 'pdf';
    case 'zip':
    case '7z':
    case 'rar':
    case 'tar':
    case 'gz':
      return 'archive';
    default:
      return 'file';
  }
}
