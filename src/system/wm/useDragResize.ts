import { useCallback, useEffect, useRef, useState } from 'react'
import type { Position, Size, Bounds } from '../store/types'

interface DragResizeOptions {
  bounds: Bounds
  onMove?: (position: Position) => void
  onResize?: (size: Size) => void
  onBoundsChange?: (bounds: Bounds) => void
  disabled?: boolean
  resizable?: boolean
  movable?: boolean
  minSize?: Size
  maxSize?: Size
  snapThreshold?: number
}

interface DragState {
  isDragging: boolean
  isResizing: boolean
  dragStart: Position
  initialBounds: Bounds
  resizeHandle: string | null
}

const RESIZE_HANDLES = [
  'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'
]

const SNAP_THRESHOLD = 20
const MIN_WINDOW_SIZE = { width: 200, height: 150 }

export function useDragResize({
  bounds,
  onMove,
  onResize,
  onBoundsChange,
  disabled = false,
  resizable = true,
  movable = true,
  minSize = MIN_WINDOW_SIZE,
  maxSize,
  snapThreshold = SNAP_THRESHOLD
}: DragResizeOptions) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    dragStart: { x: 0, y: 0 },
    initialBounds: bounds,
    resizeHandle: null
  })

  // Get screen boundaries accounting for dock and topbar
  const getScreenBounds = useCallback(() => {
    return {
      x: 64, // Dock width
      y: 48, // Topbar height
      width: window.innerWidth - 64,
      height: window.innerHeight - 48
    }
  }, [])

  // Snap to screen edges
  const snapToEdges = useCallback((newBounds: Bounds): Bounds => {
    const screen = getScreenBounds()
    const snapped = { ...newBounds }

    // Snap to left edge
    if (Math.abs(newBounds.x - screen.x) < snapThreshold) {
      snapped.x = screen.x
    }
    
    // Snap to right edge
    if (Math.abs((newBounds.x + newBounds.width) - (screen.x + screen.width)) < snapThreshold) {
      snapped.x = screen.x + screen.width - newBounds.width
    }
    
    // Snap to top edge
    if (Math.abs(newBounds.y - screen.y) < snapThreshold) {
      snapped.y = screen.y
    }
    
    // Snap to bottom edge
    if (Math.abs((newBounds.y + newBounds.height) - (screen.y + screen.height)) < snapThreshold) {
      snapped.y = screen.y + screen.height - newBounds.height
    }

    return snapped
  }, [snapThreshold, getScreenBounds])

  // Constrain bounds to screen and size limits
  const constrainBounds = useCallback((newBounds: Bounds): Bounds => {
    const screen = getScreenBounds()
    const constrained = { ...newBounds }

    // Apply size constraints
    constrained.width = Math.max(minSize.width, constrained.width)
    constrained.height = Math.max(minSize.height, constrained.height)
    
    if (maxSize) {
      constrained.width = Math.min(maxSize.width, constrained.width)
      constrained.height = Math.min(maxSize.height, constrained.height)
    }

    // Keep window within screen bounds
    constrained.x = Math.max(screen.x, Math.min(constrained.x, screen.x + screen.width - constrained.width))
    constrained.y = Math.max(screen.y, Math.min(constrained.y, screen.y + screen.height - constrained.height))

    return constrained
  }, [minSize, maxSize, getScreenBounds])

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || !movable) return
    
    e.preventDefault()
    e.stopPropagation()

    const rect = elementRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragState({
      isDragging: true,
      isResizing: false,
      dragStart: { x: e.clientX, y: e.clientY },
      initialBounds: bounds,
      resizeHandle: null
    })
  }, [disabled, movable, bounds])

  // Handle mouse down for resizing
  const handleResizeMouseDown = useCallback((handle: string) => (e: React.MouseEvent) => {
    if (disabled || !resizable) return
    
    e.preventDefault()
    e.stopPropagation()

    setDragState({
      isDragging: false,
      isResizing: true,
      dragStart: { x: e.clientX, y: e.clientY },
      initialBounds: bounds,
      resizeHandle: handle
    })
  }, [disabled, resizable, bounds])

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return

    const deltaX = e.clientX - dragState.dragStart.x
    const deltaY = e.clientY - dragState.dragStart.y

    if (dragState.isDragging) {
      // Handle dragging
      const newBounds = {
        ...dragState.initialBounds,
        x: dragState.initialBounds.x + deltaX,
        y: dragState.initialBounds.y + deltaY
      }

      const snappedBounds = snapToEdges(newBounds)
      const constrainedBounds = constrainBounds(snappedBounds)

      onMove?.({ x: constrainedBounds.x, y: constrainedBounds.y })
      onBoundsChange?.(constrainedBounds)
    } else if (dragState.isResizing && dragState.resizeHandle) {
      // Handle resizing
      const handle = dragState.resizeHandle
      let newBounds = { ...dragState.initialBounds }

      // Apply resize based on handle
      if (handle.includes('n')) {
        newBounds.y = dragState.initialBounds.y + deltaY
        newBounds.height = dragState.initialBounds.height - deltaY
      }
      if (handle.includes('s')) {
        newBounds.height = dragState.initialBounds.height + deltaY
      }
      if (handle.includes('w')) {
        newBounds.x = dragState.initialBounds.x + deltaX
        newBounds.width = dragState.initialBounds.width - deltaX
      }
      if (handle.includes('e')) {
        newBounds.width = dragState.initialBounds.width + deltaX
      }

      const constrainedBounds = constrainBounds(newBounds)
      
      onResize?.({ width: constrainedBounds.width, height: constrainedBounds.height })
      onBoundsChange?.(constrainedBounds)
    }
  }, [dragState, snapToEdges, constrainBounds, onMove, onResize, onBoundsChange])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      isResizing: false,
      dragStart: { x: 0, y: 0 },
      initialBounds: bounds,
      resizeHandle: null
    })
  }, [bounds])

  // Set up global mouse events
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = dragState.isDragging ? 'move' : 'resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  // Generate resize handles
  const resizeHandles = resizable && !disabled ? RESIZE_HANDLES.map(handle => ({
    handle,
    onMouseDown: handleResizeMouseDown(handle),
    className: `absolute cursor-${handle}-resize`,
    style: getResizeHandleStyle(handle)
  })) : []

  return {
    elementRef,
    isDragging: dragState.isDragging,
    isResizing: dragState.isResizing,
    handleMouseDown,
    resizeHandles
  }
}

// Get CSS styles for resize handles
function getResizeHandleStyle(handle: string): React.CSSProperties {
  const size = 8
  const offset = -size / 2

  const styles: React.CSSProperties = {
    width: size,
    height: size,
    zIndex: 10
  }

  switch (handle) {
    case 'n':
      return { ...styles, top: offset, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }
    case 'ne':
      return { ...styles, top: offset, right: offset, cursor: 'ne-resize' }
    case 'e':
      return { ...styles, right: offset, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' }
    case 'se':
      return { ...styles, bottom: offset, right: offset, cursor: 'se-resize' }
    case 's':
      return { ...styles, bottom: offset, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }
    case 'sw':
      return { ...styles, bottom: offset, left: offset, cursor: 'sw-resize' }
    case 'w':
      return { ...styles, left: offset, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' }
    case 'nw':
      return { ...styles, top: offset, left: offset, cursor: 'nw-resize' }
    default:
      return styles
  }
}

// Hook for window snapping
export function useWindowSnap() {
  const snapToHalf = useCallback((side: 'left' | 'right') => {
    const screen = {
      x: 64,
      y: 48,
      width: window.innerWidth - 64,
      height: window.innerHeight - 48
    }

    return {
      x: side === 'left' ? screen.x : screen.x + screen.width / 2,
      y: screen.y,
      width: screen.width / 2,
      height: screen.height
    }
  }, [])

  const snapToMaximize = useCallback(() => {
    const screen = {
      x: 64,
      y: 48,
      width: window.innerWidth - 64,
      height: window.innerHeight - 48
    }

    return {
      x: screen.x,
      y: screen.y,
      width: screen.width,
      height: screen.height
    }
  }, [])

  return {
    snapToHalf,
    snapToMaximize
  }
}
