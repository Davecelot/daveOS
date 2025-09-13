// Z-index management for window layering
export const Z_INDEX = {
  DESKTOP: 0,
  DESKTOP_ICONS: 10,
  WINDOWS_BASE: 100,
  DOCK: 1000,
  TOPBAR: 1100,
  CONTEXT_MENU: 1200,
  MODAL: 1300,
  TOOLTIP: 1400,
  NOTIFICATION: 1500,
  DRAG_OVERLAY: 1600,
} as const

export class ZIndexManager {
  private static instance: ZIndexManager
  private currentMaxZ = Z_INDEX.WINDOWS_BASE
  private windowZIndexes = new Map<string, number>()

  private constructor() {}

  static getInstance(): ZIndexManager {
    if (!ZIndexManager.instance) {
      ZIndexManager.instance = new ZIndexManager()
    }
    return ZIndexManager.instance
  }

  // Get next available z-index for windows
  getNextZIndex(): number {
    this.currentMaxZ += 1
    return this.currentMaxZ
  }

  // Set z-index for a specific window
  setWindowZIndex(windowId: string, zIndex: number): void {
    this.windowZIndexes.set(windowId, zIndex)
    this.currentMaxZ = Math.max(this.currentMaxZ, zIndex)
  }

  // Get z-index for a specific window
  getWindowZIndex(windowId: string): number {
    return this.windowZIndexes.get(windowId) || Z_INDEX.WINDOWS_BASE
  }

  // Bring window to front
  bringToFront(windowId: string): number {
    const newZIndex = this.getNextZIndex()
    this.setWindowZIndex(windowId, newZIndex)
    return newZIndex
  }

  // Send window to back
  sendToBack(windowId: string): number {
    const backZIndex = Z_INDEX.WINDOWS_BASE
    this.setWindowZIndex(windowId, backZIndex)
    return backZIndex
  }

  // Get all window z-indexes sorted
  getAllWindowZIndexes(): Array<{ windowId: string; zIndex: number }> {
    return Array.from(this.windowZIndexes.entries())
      .map(([windowId, zIndex]) => ({ windowId, zIndex }))
      .sort((a, b) => a.zIndex - b.zIndex)
  }

  // Remove window from tracking
  removeWindow(windowId: string): void {
    this.windowZIndexes.delete(windowId)
  }

  // Reset all z-indexes (useful for cleanup)
  reset(): void {
    this.windowZIndexes.clear()
    this.currentMaxZ = Z_INDEX.WINDOWS_BASE
  }

  // Get z-index for system components
  getSystemZIndex(component: keyof typeof Z_INDEX): number {
    return Z_INDEX[component]
  }
}

// Singleton instance
export const zIndexManager = ZIndexManager.getInstance()
