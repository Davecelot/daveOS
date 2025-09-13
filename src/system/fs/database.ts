import Dexie, { Table } from 'dexie';
import { FSEntry, MimeType } from '../store/types';

export interface DBFSEntry extends Omit<FSEntry, 'children' | 'parent'> {
  parentId?: string;
}

export interface DBTrashEntry {
  id: string;
  originalEntry: DBFSEntry;
  deletedAt: Date;
  originalPath: string;
}

export interface DBMimeAssociation {
  id: string;
  mimeType: MimeType;
  appId: string;
  isDefault: boolean;
}

export class DaveOSDatabase extends Dexie {
  fsEntries!: Table<DBFSEntry>;
  trash!: Table<DBTrashEntry>;
  mimeAssociations!: Table<DBMimeAssociation>;

  constructor() {
    super('DaveOSDatabase');
    
    this.version(1).stores({
      fsEntries: 'id, name, type, parentId, path, createdAt, modifiedAt, size, mimeType',
      trash: '++id, deletedAt, originalPath',
      mimeAssociations: 'id, mimeType, appId, isDefault'
    });

    this.fsEntries.hook('creating', function (_primKey, obj, _trans) {
      (obj as any).createdAt = new Date();
      (obj as any).modifiedAt = new Date();
    });

    this.fsEntries.hook('updating', function (modifications, _primKey, _obj, _trans) {
      (modifications as any).modifiedAt = new Date();
    });
  }
}

export const db = new DaveOSDatabase();

// Initialize database with error handling
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    await db.open();
    console.log('DaveOS Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

// Database utilities
export const isDatabaseReady = (): boolean => {
  return db.isOpen();
};

export const clearDatabase = async (): Promise<void> => {
  await db.transaction('rw', [db.fsEntries, db.trash, db.mimeAssociations], async () => {
    await db.fsEntries.clear();
    await db.trash.clear();
    await db.mimeAssociations.clear();
  });
};
