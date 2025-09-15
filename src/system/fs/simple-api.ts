import { db, initializeDatabase } from './database';
import { FSEntryType, MimeType } from '../store/types';

export interface SimpleEntry {
  id?: string;
  name: string;
  type: FSEntryType;
  path: string;
  parentId?: string;
  size: number;
  mimeType: MimeType;
  content?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  modifiedAt?: Date;
}

export class SimpleFileSystemAPI {
  static async initialize(): Promise<boolean> {
    try {
      const success = await initializeDatabase();
      if (success) {
        await this.seedIfEmpty();
      }
      return success;
    } catch (error) {
      console.error('Failed to initialize filesystem:', error);
      return false;
    }
  }

  static async seedIfEmpty(): Promise<void> {
    try {
      const count = await db.fsEntries.count();
      if (count > 0) return;

      console.log('Seeding filesystem...');

      // Create root
      await db.fsEntries.add({
        id: 'root',
        name: '',
        type: FSEntryType.FOLDER,
        path: '/',
        parentId: undefined,
        size: 0,
        mimeType: 'inode/directory' as MimeType,
        content: '',
        metadata: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      // Create home structure
      await db.fsEntries.add({
        id: 'home',
        name: 'home',
        type: FSEntryType.FOLDER,
        path: '/home',
        parentId: 'root',
        size: 0,
        mimeType: 'inode/directory' as MimeType,
        content: '',
        metadata: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      await db.fsEntries.add({
        id: 'user',
        name: 'user',
        type: FSEntryType.FOLDER,
        path: '/home/user',
        parentId: 'home',
        size: 0,
        mimeType: 'inode/directory' as MimeType,
        content: '',
        metadata: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      // Create user directories
      const userDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos'];
      for (const dir of userDirs) {
        await db.fsEntries.add({
          id: `user-${dir.toLowerCase()}`,
          name: dir,
          type: FSEntryType.FOLDER,
          path: `/home/user/${dir}`,
          parentId: 'user',
          size: 0,
          mimeType: 'inode/directory' as MimeType,
          content: '',
          metadata: {},
          createdAt: new Date(),
          modifiedAt: new Date()
        });
      }

      // Create welcome file
      const welcomeContent = `Welcome to DaveOS!

A modern web-based operating system built with React and TypeScript.

Features:
- File system management
- Built-in applications
- Window management
- System settings

Explore and enjoy!`;
      
      await db.fsEntries.add({
        id: 'welcome-txt',
        name: 'Welcome.txt',
        type: FSEntryType.FILE,
        path: '/home/user/Desktop/Welcome.txt',
        parentId: 'user-desktop',
        size: welcomeContent.length,
        mimeType: 'text/plain' as MimeType,
        content: welcomeContent,
        metadata: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      console.log('Filesystem seeded successfully');
    } catch (error) {
      console.error('Failed to seed filesystem:', error);
    }
  }

  static async getEntries(parentPath: string = '/'): Promise<SimpleEntry[]> {
    try {
      if (parentPath === '/') {
        return await db.fsEntries.where('parentId').equals('').toArray();
      }
      
      const parent = await db.fsEntries.where('path').equals(parentPath).first();
      if (!parent) return [];
      
      return await db.fsEntries.where('parentId').equals(parent.id!.toString()).toArray();
    } catch (error) {
      console.error('Failed to get entries:', error);
      return [];
    }
  }

  static async getEntryByPath(path: string): Promise<SimpleEntry | undefined> {
    try {
      if (path === '/') {
        return await db.fsEntries.get('root');
      }
      return await db.fsEntries.where('path').equals(path).first();
    } catch (error) {
      console.error(`Failed to get entry by path ${path}:`, error);
      return undefined;
    }
  }

  static async createFolder(name: string, parentPath: string): Promise<boolean> {
    try {
      const parent = await db.fsEntries.where('path').equals(parentPath).first();
      const parentId = parent?.id?.toString();
      
      const id = await db.fsEntries.add({
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: FSEntryType.FOLDER,
        path: `${parentPath}/${name}`,
        parentId,
        size: 0,
        mimeType: 'inode/directory' as MimeType,
        content: '',
        metadata: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });
      
      return !!id;
    } catch (error) {
      console.error('Failed to create folder:', error);
      return false;
    }
  }

  static async createFile(name: string, content: string, parentPath: string, mimeType: MimeType = 'text/plain'): Promise<boolean> {
    try {
      const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
      const parent = parentPath === '/' ? null : await db.fsEntries.where('path').equals(parentPath).first();
      
      await db.fsEntries.add({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: FSEntryType.FILE,
        path,
        parentId: parent?.id?.toString(),
        size: content.length,
        mimeType,
        content,
        metadata: {},
        createdAt: new Date(),
        modifiedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to create file:', error);
      return false;
    }
  }

  static async deleteEntry(id: string): Promise<boolean> {
    try {
      await db.fsEntries.delete(parseInt(id));
      return true;
    } catch (error) {
      console.error('Failed to delete entry:', error);
      return false;
    }
  }

  static async renameEntry(id: string, newName: string): Promise<boolean> {
    try {
      const entry = await db.fsEntries.get(parseInt(id));
      if (!entry) return false;
      
      const pathParts = entry.path.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      
      await db.fsEntries.update(parseInt(id), {
        name: newName,
        path: newPath,
        modifiedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to rename entry:', error);
      return false;
    }
  }
}
