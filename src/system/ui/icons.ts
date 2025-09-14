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

export const XP_BASE = '/icons/xp-selected/';
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
  'my-documents': 'Folder',
  documents: 'Folder',
  'recycle-bin': 'Trash2',
  'my-network': 'Network',
  internet: 'Globe',
  search: 'Search',
  'control-panel': 'Settings',
  settings: 'Settings',
  run: 'Play',
  'task-manager': 'ListChecks',
  'show-desktop': 'SquareDashedBottom',
  volume: 'Volume2',
  network: 'Network',
  pictures: 'Image',
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

// Common size buckets in the XP icon theme
export const XP_SIZE_DIRS = [16, 22, 24, 32, 48, 64, 72, 96, 128] as const;

function nearestSizes(size?: number): number[] {
  if (!size) return [32, 24, 48, 16, 64, 72, 96, 128];
  return [...XP_SIZE_DIRS].sort((a, b) => Math.abs(a - size) - Math.abs(b - size));
}

function xpPath(section: string, s: number, filename: string) {
  return `winxp/${section}/${s}/${filename}`
}

function xpCandidatesFor(key: IconName, size?: number): string[] {
  const sizes = nearestSizes(size);
  const out: string[] = [];
  const add = (section: string, ...names: string[]) => {
    for (const s of sizes) {
      for (const n of names) {
        out.push(xpPath(section, s, n))
      }
    }
  }
  switch (key) {
    case 'my-computer':
      add('devices', 'computer.png', 'gnome-computer.png', 'gnome-dev-computer.png');
      break;
    case 'my-documents':
    case 'documents':
      add('places', 'folder-documents.png', 'default-folder-documents.png', 'stock_folder.png', 'gnome-folder.png');
      break;
    case 'recycle-bin':
      // Try action and places variants found in the theme
      add('actions', 'trash-empty.png');
      add('places', 'emptytrash.png', 'gnome-fs-trash-empty.png', 'gnome-dev-trash-empty.png');
      break;
    case 'my-network':
      add('apps', 'preferences-system-network.png', 'network-manager.png');
      break;
    case 'internet':
      add('apps', 'internet-web-browser.png');
      break;
    case 'search':
      // Prefer action names widely used across themes, and also try app-level search icons
      add('actions', 'edit-find.png', 'gtk-find.png', 'stock_search.png', 'search.png');
      add('apps', 'system-search.png', 'preferences-system-search.png');
      break;
    case 'control-panel':
      add('apps', 'gnome-control-center.png', 'kcontrol.png');
      // Some themes provide control center under categories as well
      add('categories', 'gnome-control-center.png');
      break;
    case 'settings':
      add('apps', 'preferences-system.png');
      break;
    case 'run':
      add('actions', 'system-run.png');
      break;
    case 'task-manager':
      add('apps', 'gnome-system-monitor.png', 'utilities-system-monitor.png');
      break;
    case 'show-desktop':
      add('places', 'desktop.png', 'org.xfce.panel.showdesktop.png');
      break;
    case 'volume':
      add('apps', 'multimedia-volume-control.png');
      break;
    case 'network':
      add('apps', 'preferences-system-network.png');
      break;
    case 'pictures':
      // Theme uses hyphenated variant; keep underscore as fallback just in case
      add('places', 'folder-pictures.png', 'folder_pictures.png');
      break;
    case 'music':
      add('places', 'folder-music.png', 'folder_sound.png');
      break;
    case 'printers':
      add('devices', 'printer.png');
      break;
    case 'email':
      add('apps', 'internet-mail.png');
      break;
    case 'folder':
      add('places', 'stock_folder.png', 'gnome-folder.png');
      break;
    case 'file':
      // generic file fallback via lucide mostly; XP theme doesn't have one single generic
      break;
    case 'text':
      add('mimes', 'application-text.png');
      break;
    case 'image':
      add('mimes', 'image-x-generic.png');
      break;
    case 'audio':
      add('mimes', 'audio-x-generic.png');
      break;
    case 'video':
      add('mimes', 'video-x-generic.png');
      break;
    case 'pdf':
      add('mimes', 'application-pdf.png');
      break;
    case 'archive':
      add('mimes', 'application-zip.png');
      break;
    case 'notepad':
      add('apps', 'text-editor.png', 'accessories-text-editor.png');
      break;
    case 'paint':
      add('apps', 'kolourpaint.png', 'mtpaint.png');
      break;
    case 'wmp':
      add('apps', 'multimedia-video-player.png');
      break;
    case 'calculator':
      add('apps', 'accessories-calculator.png', 'gnome-calculator.png');
      break;
    case 'minesweeper':
      add('apps', 'minesweeper.png');
      break;
    case 'solitaire':
      add('apps', 'solitaire.png');
      break;
    case 'start':
      add('places', 'start-here.png');
      break;
    case 'back':
      add('actions', 'go-previous.png');
      break;
    case 'forward':
      add('actions', 'go-next.png');
      break;
    case 'up':
      add('actions', 'go-up.png');
      break;
    case 'home':
      add('actions', 'go-home.png');
      break;
    case 'refresh':
      add('actions', 'view-refresh.png');
      break;
    case 'list':
      add('actions', 'view-list.png', 'view-list-details.png');
      break;
    case 'grid':
      add('actions', 'view-grid.png');
      break;
    case 'trash':
      add('actions', 'edit-delete.png');
      break;
    case 'copy':
      add('actions', 'edit-copy.png');
      break;
    case 'cut':
      add('actions', 'edit-cut.png');
      break;
    case 'new-folder':
      add('actions', 'folder-new.png');
      break;
    case 'new-file':
      add('actions', 'document-new.png');
      break;
    case 'help':
      add('apps', 'help-browser.png');
      break;
  }
  return out.map(p => XP_BASE + p);
}

export function getIconCandidates(name: IconName | string, size?: number): string[] {
  const key = name as IconName;
  const xp = xpCandidatesFor(key, size);
  const baseCandidates = ICON_CANDIDATES[key] || ICON_CANDIDATES['file'] || [];
  const xpLegacy = baseCandidates.map((f) => XP_BASE + f);
  const cc0 = baseCandidates.map((f) => CC0_BASE + f);
  const lucideKey = LUCIDE_FALLBACK[key] || LUCIDE_FALLBACK['file'];
  const lucide = lucideKey ? [`lucide:${lucideKey}`] : [];
  return [...xp, ...xpLegacy, ...cc0, ...lucide];
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
