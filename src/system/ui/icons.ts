/* Icon mapping and utilities for Windows XP style icons */

export type IconName =
  | 'my-computer'
  | 'my-documents'
  | 'documents'
  | 'recycle-bin'
  | 'my-network'
  | 'internet'
  | 'search'
  | 'control-panel'
  | 'settings'
  | 'run'
  | 'task-manager'
  | 'show-desktop'
  | 'volume'
  | 'network'
  | 'pictures'
  | 'music'
  | 'printers'
  | 'email'
  | 'start'
  | 'back'
  | 'forward'
  | 'up'
  | 'home'
  | 'refresh'
  | 'list'
  | 'grid'
  | 'trash'
  | 'copy'
  | 'cut'
  | 'new-folder'
  | 'new-file'
  | 'help'
  | 'folder'
  | 'file'
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'archive'
  | 'notepad'
  | 'paint'
  | 'wmp'
  | 'calculator'
  | 'minesweeper'
  | 'solitaire';

export const XP_BASE = '/icons/xp/';
export const CC0_BASE = '/icons/xp-cc0/';

// For dev: we don't know exact filenames in the pack; provide multiple candidates per icon.
// The Icon component will attempt each candidate in order, across XP first, then CC0 fallback.
export const ICON_CANDIDATES: Record<IconName, string[]> = {
  'my-computer': [
    'computer.png',
    'my-computer.png',
    'computer.svg',
  ],
  'my-documents': ['my-documents.png', 'documents.png', 'folder-documents.png'],
  'documents': ['documents.png', 'my-documents.png'],
  'recycle-bin': ['recycle-bin.png', 'trash.png', 'bin.png'],
  'my-network': ['network-places.png', 'network.png', 'lan.png'],
  internet: ['internet-explorer.png', 'globe.png', 'internet.png'],
  search: ['search.png', 'find.png'],
  'control-panel': ['control-panel.png', 'settings-control-panel.png', 'control.png'],
  settings: ['settings.png', 'preferences.png'],
  run: ['run.png', 'execute.png'],
  'task-manager': ['task-manager.png', 'tasks.png'],
  'show-desktop': ['show-desktop.png', 'desktop.png'],
  volume: ['volume.png', 'speaker.png', 'sound.png'],
  network: ['network.png', 'lan.png'],
  pictures: ['pictures.png', 'my-pictures.png', 'image.png'],
  music: ['music.png', 'my-music.png', 'audio.png'],
  printers: ['printers.png', 'printer.png'],
  email: ['email.png', 'outlook.png', 'mail.png'],
  start: ['start.png', 'windows.png', 'win-logo.png'],
  back: ['back.png', 'arrow-left.png'],
  forward: ['forward.png', 'arrow-right.png'],
  up: ['up.png', 'arrow-up.png'],
  home: ['home.png'],
  refresh: ['refresh.png'],
  list: ['list.png', 'view-list.png'],
  grid: ['grid.png', 'view-icons.png'],
  trash: ['trash.png', 'recycle-bin.png'],
  copy: ['copy.png'],
  cut: ['cut.png', 'scissors.png'],
  'new-folder': ['new-folder.png', 'folder-plus.png'],
  'new-file': ['new-file.png', 'file-plus.png'],
  help: ['help.png', 'question.png'],
  folder: ['folder.png', 'directory.png'],
  file: ['file.png', 'document.png'],
  text: ['text.png', 'txt.png', 'file-text.png'],
  image: ['image.png', 'picture.png', 'photo.png'],
  audio: ['audio.png', 'music.png'],
  video: ['video.png', 'movie.png'],
  pdf: ['pdf.png', 'document-pdf.png'],
  archive: ['archive.png', 'zip.png'],
  notepad: ['notepad.png', 'texteditor.png'],
  paint: ['paint.png', 'mspaint.png'],
  wmp: ['wmp.png', 'media-player.png'],
  calculator: ['calculator.png', 'calc.png'],
  minesweeper: ['minesweeper.png', 'mine.png'],
  solitaire: ['solitaire.png', 'cards.png'],
};

// Optional lucide-react final fallback mapping
export const LUCIDE_FALLBACK: Partial<Record<IconName, string>> = {
  'my-computer': 'Monitor',
  'my-documents': 'FolderKanban',
  documents: 'FolderKanban',
  'recycle-bin': 'Trash2',
  'my-network': 'Network',
  internet: 'Globe',
  search: 'Search',
  'control-panel': 'PanelsTopLeft',
  settings: 'Settings',
  run: 'Play',
  'task-manager': 'ListChecks',
  'show-desktop': 'SquareDashedBottom',
  volume: 'Volume2',
  network: 'Network',
  pictures: 'Images',
  music: 'Music2',
  printers: 'Printer',
  email: 'Mail',
  folder: 'Folder',
  file: 'File',
  text: 'FileText',
  image: 'Image',
  audio: 'Music2',
  video: 'Video',
  pdf: 'FileType2',
  archive: 'Archive',
  notepad: 'NotebookPen',
  paint: 'Paintbrush',
  wmp: 'PlayCircle',
  calculator: 'Calculator',
  minesweeper: 'Bomb',
  solitaire: 'PlayingCards',
};

export function getIconCandidates(name: IconName | string): string[] {
  const key = name as IconName;
  const baseCandidates = ICON_CANDIDATES[key] || ICON_CANDIDATES['file'] || [];
  const xp = baseCandidates.map((f) => XP_BASE + f);
  const cc0 = baseCandidates.map((f) => CC0_BASE + f);
  const lucideKey = LUCIDE_FALLBACK[key] || LUCIDE_FALLBACK['file'];
  const lucide = lucideKey ? [`lucide:${lucideKey}`] : [];
  return [...xp, ...cc0, ...lucide];
}

// Helper to map appId to a default icon name for taskbar/buttons
export function appIdToIcon(appId: string): IconName {
  switch (appId) {
    case 'files':
      return 'folder';
    case 'textedit':
      return 'notepad';
    case 'calculator':
      return 'calculator';
    case 'imageviewer':
      return 'image';
    case 'systemmonitor':
      return 'task-manager';
    case 'settings':
      return 'settings';
    case 'terminal':
      return 'text';
    default:
      return 'file';
  }
}
