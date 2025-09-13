import { db, DBMimeAssociation } from './database';
import { MimeType } from '../store/types';

export class MimeTypeManager {
  // Default MIME type associations
  private static defaultAssociations: Record<MimeType, string[]> = {
    // Text files
    'text/plain': ['text-editor'],
    'text/markdown': ['text-editor'],
    'text/html': ['text-editor', 'web-browser'],
    'text/css': ['text-editor'],
    'text/javascript': ['text-editor'],
    'text/typescript': ['text-editor'],
    'application/json': ['text-editor'],
    'application/xml': ['text-editor'],
    'application/yaml': ['text-editor'],

    // Images
    'image/jpeg': ['image-viewer'],
    'image/png': ['image-viewer'],
    'image/gif': ['image-viewer'],
    'image/svg+xml': ['image-viewer', 'text-editor'],
    'image/webp': ['image-viewer'],
    'image/bmp': ['image-viewer'],

    // Audio
    'audio/mpeg': ['music-player'],
    'audio/wav': ['music-player'],
    'audio/ogg': ['music-player'],
    'audio/mp4': ['music-player'],
    'audio/flac': ['music-player'],

    // Video
    'video/mp4': ['video-player'],
    'video/webm': ['video-player'],
    'video/ogg': ['video-player'],
    'video/avi': ['video-player'],
    'video/mov': ['video-player'],

    // Documents
    'application/pdf': ['pdf-viewer'],
    'application/msword': ['document-viewer'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['document-viewer'],
    'application/vnd.ms-excel': ['spreadsheet-viewer'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['spreadsheet-viewer'],

    // Archives
    'application/zip': ['archive-manager'],
    'application/x-tar': ['archive-manager'],
    'application/gzip': ['archive-manager'],
    'application/x-7z-compressed': ['archive-manager'],

    // Scripts
    'application/x-shellscript': ['text-editor', 'terminal'],
    'application/x-python': ['text-editor'],
    'application/x-php': ['text-editor'],

    // System
    'inode/directory': ['file-manager'],
    'application/x-executable': ['terminal'],
    'application/x-desktop': ['desktop-file-handler']
  };

  // Get MIME type from file extension
  static getMimeTypeFromExtension(filename: string): MimeType {
    const ext = filename.toLowerCase().split('.').pop();
    
    const extensionMap: Record<string, MimeType> = {
      // Text
      'txt': 'text/plain',
      'md': 'text/markdown',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'json': 'application/json',
      'xml': 'application/xml',
      'yaml': 'application/yaml',
      'yml': 'application/yaml',

      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'bmp': 'image/bmp',

      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      'flac': 'audio/flac',

      // Video
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogv': 'video/ogg',
      'avi': 'video/avi',
      'mov': 'video/mov',

      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      // Archives
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      '7z': 'application/x-7z-compressed',

      // Scripts
      'sh': 'application/x-shellscript',
      'bash': 'application/x-shellscript',
      'py': 'application/x-python',
      'php': 'application/x-php',

      // System
      'desktop': 'application/x-desktop'
    };

    return extensionMap[ext || ''] || 'text/plain';
  }

  // Get file icon based on MIME type
  static getFileIcon(mimeType: MimeType): string {
    const iconMap: Record<string, string> = {
      // Text files
      'text/': '📄',
      'application/json': '📋',
      'application/xml': '📋',

      // Images
      'image/': '🖼️',

      // Audio
      'audio/': '🎵',

      // Video
      'video/': '🎬',

      // Documents
      'application/pdf': '📕',
      'application/msword': '📘',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
      'application/vnd.ms-excel': '📊',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',

      // Archives
      'application/zip': '📦',
      'application/x-tar': '📦',
      'application/gzip': '📦',
      'application/x-7z-compressed': '📦',

      // Scripts
      'application/x-shellscript': '⚙️',
      'application/x-python': '🐍',
      'application/x-php': '🐘',

      // System
      'inode/directory': '📁',
      'application/x-executable': '⚙️',
      'application/x-desktop': '🖥️'
    };

    // Try exact match first
    if (iconMap[mimeType]) {
      return iconMap[mimeType];
    }

    // Try category match
    const category = mimeType.split('/')[0] + '/';
    if (iconMap[category]) {
      return iconMap[category];
    }

    // Default icon
    return '📄';
  }

  // Initialize default MIME associations
  static async initializeDefaultAssociations(): Promise<void> {
    try {
      const existingCount = await db.mimeAssociations.count();
      if (existingCount > 0) {
        console.log('MIME associations already initialized');
        return;
      }

      console.log('Initializing default MIME associations...');

      const associations: DBMimeAssociation[] = [];

      for (const [mimeTypeKey, appIds] of Object.entries(this.defaultAssociations)) {
        const mimeType = mimeTypeKey as MimeType;
        appIds.forEach((appId, index) => {
          associations.push({
            id: `${mimeType}-${appId}`,
            mimeType,
            appId,
            isDefault: index === 0 // First app is default
          });
        });
      }

      await db.mimeAssociations.bulkAdd(associations as DBMimeAssociation[]);
      console.log('Default MIME associations initialized');
    } catch (error) {
      console.error('Failed to initialize MIME associations:', error);
    }
  }

  // Get associated apps for a MIME type
  static async getAssociatedApps(mimeType: MimeType): Promise<string[]> {
    try {
      const associations = await db.mimeAssociations
        .where('mimeType')
        .equals(mimeType)
        .toArray();

      return associations
        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
        .map(assoc => assoc.appId);
    } catch (error) {
      console.error('Failed to get associated apps:', error);
      return this.defaultAssociations[mimeType] || [];
    }
  }

  // Get default app for a MIME type
  static async getDefaultApp(mimeType: MimeType): Promise<string | null> {
    try {
      const association = await db.mimeAssociations
        .where('mimeType')
        .equals(mimeType)
        .and(assoc => assoc.isDefault)
        .first();

      return association?.appId || null;
    } catch (error) {
      console.error('Failed to get default app:', error);
      return this.defaultAssociations[mimeType]?.[0] || null;
    }
  }

  // Set default app for a MIME type
  static async setDefaultApp(mimeType: MimeType, appId: string): Promise<boolean> {
    try {
      await db.transaction('rw', [db.mimeAssociations], async () => {
        // Remove default flag from all associations for this MIME type
        await db.mimeAssociations
          .where('mimeType')
          .equals(mimeType)
          .modify({ isDefault: false });

        // Set new default
        const existing = await db.mimeAssociations
          .where('mimeType')
          .equals(mimeType)
          .and(assoc => assoc.appId === appId)
          .first();

        if (existing) {
          await db.mimeAssociations.update(existing.id!, { isDefault: true });
        } else {
          await db.mimeAssociations.add({
            id: `${mimeType}-${appId}`,
            mimeType,
            appId,
            isDefault: true
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to set default app:', error);
      return false;
    }
  }

  // Add app association for a MIME type
  static async addAssociation(mimeType: MimeType, appId: string, isDefault: boolean = false): Promise<boolean> {
    try {
      if (isDefault) {
        // Remove default flag from existing associations
        await db.mimeAssociations
          .where('mimeType')
          .equals(mimeType)
          .modify({ isDefault: false });
      }

      await db.mimeAssociations.add({
        id: `${mimeType}-${appId}`,
        mimeType,
        appId,
        isDefault
      });

      return true;
    } catch (error) {
      console.error('Failed to add association:', error);
      return false;
    }
  }

  // Remove app association for a MIME type
  static async removeAssociation(mimeType: MimeType, appId: string): Promise<boolean> {
    try {
      await db.mimeAssociations
        .where('mimeType')
        .equals(mimeType)
        .and(assoc => assoc.appId === appId)
        .delete();

      return true;
    } catch (error) {
      console.error('Failed to remove association:', error);
      return false;
    }
  }
}
