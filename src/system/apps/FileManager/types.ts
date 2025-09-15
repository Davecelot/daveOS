export type ViewMode = 'icons' | 'list' | 'details';

export interface FileEntry {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt: Date;
  icon: string;
}

export interface Folder {
  path: string;
  entries: FileEntry[];
}
