import { db, DBFSEntry, DBTrashEntry } from './database';
import { FSEntry, FSEntryType, MimeType } from '../store/types';

export class FileSystemAPI {
  // Create operations
  static async createEntry(entry: Omit<FSEntry, 'id' | 'createdAt' | 'modifiedAt' | 'children'>): Promise<string> {
    const dbEntry: Omit<DBFSEntry, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: entry.name,
      type: entry.type,
      path: entry.path,
      parent: entry.parent || null,
      parentId: entry.parent || undefined,
      size: entry.size || 0,
      mimeType: entry.mimeType,
      content: entry.content,
      metadata: entry.metadata
    };

    const id = await db.fsEntries.add(dbEntry as DBFSEntry);
    return id.toString();
  }

  static async createFolder(name: string, parentPath: string = '/'): Promise<string> {
    const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    const parent = parentPath === '/' ? null : await this.getEntryByPath(parentPath);
    
    return this.createEntry({
      name,
      type: FSEntryType.FOLDER,
      path,
      parent: parent?.id || null,
      size: 0,
      mimeType: 'inode/directory' as MimeType
    });
  }

  static async createFile(
    name: string, 
    content: string = '', 
    mimeType: MimeType,
    parentPath: string = '/'
  ): Promise<string> {
    const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    const parent = parentPath === '/' ? null : await this.getEntryByPath(parentPath);
    
    return this.createEntry({
      name,
      type: FSEntryType.FILE,
      path,
      parent: parent?.id || null,
      size: new Blob([content]).size,
      mimeType,
      content
    });
  }

  // Read operations
  static async getEntry(id: string): Promise<FSEntry | null> {
    const dbEntry = await db.fsEntries.get(id);
    if (!dbEntry) return null;
    
    return this.dbEntryToFSEntry(dbEntry);
  }

  static async getEntryByPath(path: string): Promise<FSEntry | null> {
    const dbEntry = await db.fsEntries.where('path').equals(path).first();
    if (!dbEntry) return null;
    
    return this.dbEntryToFSEntry(dbEntry);
  }

  static async getChildren(parentId: string | null): Promise<FSEntry[]> {
    const dbEntries = await db.fsEntries
      .where('parentId')
      .equals(parentId === null ? (undefined as any) : parentId)
      .toArray();
    
    return Promise.all(dbEntries.map(entry => this.dbEntryToFSEntry(entry)));
  }

  static async getFolderContents(path: string): Promise<FSEntry[]> {
    const parent = await this.getEntryByPath(path);
    if (!parent) return [];
    
    return this.getChildren(parent.id);
  }

  static async searchEntries(query: string, type?: FSEntryType): Promise<FSEntry[]> {
    let collection = db.fsEntries.where('name').startsWithIgnoreCase(query);
    
    if (type) {
      collection = collection.and(entry => entry.type === type);
    }
    
    const dbEntries = await collection.toArray();
    return Promise.all(dbEntries.map(entry => this.dbEntryToFSEntry(entry)));
  }

  // Update operations
  static async updateEntry(id: string, updates: Partial<FSEntry>): Promise<boolean> {
    try {
      const dbUpdates: Partial<DBFSEntry> = {
        ...updates,
        parentId: updates.parent || undefined
      };
      delete (dbUpdates as any).parent;
      delete (dbUpdates as any).children;
      
      await db.fsEntries.update(id, dbUpdates);
      return true;
    } catch (error) {
      console.error('Failed to update entry:', error);
      return false;
    }
  }

  static async renameEntry(id: string, newName: string): Promise<boolean> {
    const entry = await this.getEntry(id);
    if (!entry) return false;
    
    const pathParts = entry.path.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');
    
    return this.updateEntry(id, { name: newName, path: newPath });
  }

  static async moveEntry(id: string, newParentPath: string): Promise<boolean> {
    const entry = await this.getEntry(id);
    if (!entry) return false;
    
    const newParent = await this.getEntryByPath(newParentPath);
    const newPath = newParentPath === '/' ? `/${entry.name}` : `${newParentPath}/${entry.name}`;
    
    return this.updateEntry(id, { 
      parent: newParent?.id || null, 
      path: newPath 
    });
  }

  // Delete operations
  static async deleteEntry(id: string, moveToTrash: boolean = true): Promise<boolean> {
    try {
      const entry = await db.fsEntries.get(id);
      if (!entry) return false;

      if (moveToTrash) {
        // Move to trash
        const trashEntry: Omit<DBTrashEntry, 'id'> = {
          originalEntry: entry,
          deletedAt: new Date(),
          originalPath: entry.path
        };
        
        await db.transaction('rw', [db.fsEntries, db.trash], async () => {
          await db.trash.add(trashEntry as DBTrashEntry);
          await db.fsEntries.delete(id);
        });
      } else {
        // Permanent delete
        await db.fsEntries.delete(id);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete entry:', error);
      return false;
    }
  }

  // Trash operations
  static async getTrashContents(): Promise<DBTrashEntry[]> {
    return db.trash.orderBy('deletedAt').reverse().toArray();
  }

  static async restoreFromTrash(trashId: string): Promise<boolean> {
    try {
      const trashEntry = await db.trash.get(trashId);
      if (!trashEntry) return false;

      await db.transaction('rw', [db.fsEntries, db.trash], async () => {
        await db.fsEntries.add(trashEntry.originalEntry);
        await db.trash.delete(trashId);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to restore from trash:', error);
      return false;
    }
  }

  static async emptyTrash(): Promise<boolean> {
    try {
      await db.trash.clear();
      return true;
    } catch (error) {
      console.error('Failed to empty trash:', error);
      return false;
    }
  }

  // Utility methods
  private static async dbEntryToFSEntry(dbEntry: DBFSEntry): Promise<FSEntry> {
    const children = await this.getChildren(dbEntry.id!);
    
    return {
      id: dbEntry.id!,
      name: dbEntry.name,
      type: dbEntry.type,
      path: dbEntry.path,
      parent: dbEntry.parentId || null,
      children,
      size: dbEntry.size || 0,
      mimeType: dbEntry.mimeType,
      content: dbEntry.content,
      metadata: dbEntry.metadata,
      createdAt: dbEntry.createdAt!,
      modifiedAt: dbEntry.modifiedAt!
    };
  }

  // Import/Export operations
  static async exportEntry(id: string): Promise<Blob | null> {
    const entry = await this.getEntry(id);
    if (!entry) return null;
    
    const exportData = {
      entry,
      exportedAt: new Date(),
      version: '1.0'
    };
    
    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }

  static async importEntry(file: File, parentPath: string = '/'): Promise<string | null> {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.entry) {
        throw new Error('Invalid import file format');
      }
      
      const entry = importData.entry;
      const newPath = parentPath === '/' ? `/${entry.name}` : `${parentPath}/${entry.name}`;
      
      return this.createEntry({
        name: entry.name,
        type: entry.type,
        path: newPath,
        parent: parentPath === '/' ? null : (await this.getEntryByPath(parentPath))?.id || null,
        size: entry.size,
        mimeType: entry.mimeType,
        content: entry.content,
        metadata: entry.metadata
      });
    } catch (error) {
      console.error('Failed to import entry:', error);
      return null;
    }
  }
}
