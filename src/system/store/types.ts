// Core system types
export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Bounds extends Position, Size {}

// Window types
export interface WindowState {
  id: string
  appId: string
  title: string
  bounds: Bounds
  minimized: boolean
  maximized: boolean
  focused: boolean
  zIndex: number
  resizable: boolean
  movable: boolean
  closable: boolean
  minimizable: boolean
  maximizable: boolean
  visible: boolean
  workspace: number
}

export interface WindowAction {
  type: 'open' | 'close' | 'focus' | 'minimize' | 'maximize' | 'restore' | 'move' | 'resize'
  windowId: string
  payload?: any
}

// App types
export interface AppDefinition {
  id: string
  name: string
  icon: string
  category: 'system' | 'office' | 'media' | 'games' | 'utilities' | 'development'
  component: React.ComponentType<AppProps>
  defaultSize: Size
  minSize?: Size
  maxSize?: Size
  resizable?: boolean
  singleton?: boolean // Only one instance allowed
  pinned?: boolean // Pinned to dock
}

export interface AppProps {
  windowId: string
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
}

export interface AppInstance {
  id: string
  appId: string
  windowId: string
  props: Record<string, any>
  createdAt: Date
}

// Workspace types
export interface Workspace {
  id: number
  name: string
  windows: string[]
  active: boolean
}

// Settings types
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto'
  accentColor: string
  fontSize: 'small' | 'normal' | 'large' | 'xl'
  reducedMotion: boolean
  highContrast: boolean
}

export interface DockSettings {
  position: 'left' | 'right' | 'bottom'
  size: 'small' | 'normal' | 'large'
  autoHide: boolean
  pinnedApps: string[]
}

export interface SystemSettings {
  theme: ThemeSettings
  dock: DockSettings
  language: string
  timezone: string
  use24HourFormat: boolean
  wallpaper: string
  shortcuts: Record<string, string>
}

// File system types
export interface FileSystemEntry {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  mimeType?: string
  content?: ArrayBuffer | string
  parentId?: string
  createdAt: Date
  modifiedAt: Date
  isHidden: boolean
  isTrash: boolean
  permissions: {
    read: boolean
    write: boolean
    execute: boolean
  }
}

export interface FileSystemStats {
  totalFiles: number
  totalDirectories: number
  totalSize: number
  trashSize: number
}

// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  persistent: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  id: string
  label: string
  action: () => void
}

// Terminal types
export interface TerminalCommand {
  command: string
  args: string[]
  cwd: string
  timestamp: Date
}

export interface TerminalHistory {
  commands: TerminalCommand[]
  currentIndex: number
}

export interface TerminalSession {
  id: string
  cwd: string
  history: TerminalHistory
  environment: Record<string, string>
}

// Quick Settings types
export interface QuickSetting {
  id: string
  label: string
  icon: string
  type: 'toggle' | 'slider' | 'button'
  value: boolean | number
  min?: number
  max?: number
  step?: number
  action: (value: any) => void
}

// Context menu types
export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuItem[]
  action?: () => void
}

export interface ContextMenuState {
  visible: boolean
  position: Position
  items: ContextMenuItem[]
  target?: HTMLElement
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  id: string
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: () => void
  description: string
  global?: boolean
}

// Session types
export interface SessionData {
  windows: WindowState[]
  workspaces: Workspace[]
  currentWorkspace: number
  settings: SystemSettings
  timestamp: Date
}

// Search types
export interface SearchResult {
  id: string
  title: string
  description: string
  icon: string
  type: 'app' | 'file' | 'setting' | 'command'
  action: () => void
  score: number
}

// Drag and drop types
export interface DragData {
  type: 'file' | 'window' | 'app'
  data: any
  source: string
}

export interface DropTarget {
  id: string
  accepts: string[]
  onDrop: (data: DragData) => void
  onDragOver?: (data: DragData) => boolean
}
