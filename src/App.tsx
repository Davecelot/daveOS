import { useEffect } from 'react';
import { useSettingsStore } from './system/store/settings';
import { useSessionStore } from './system/store/session';
import { useSimpleFileSystemStore } from './system/store/simple-filesystem';
import { Taskbar } from './system/ui/Taskbar';
import { Desktop } from './system/ui/Desktop';
import { Overview } from './system/ui/Overview';
import { WindowManager } from './system/wm/Window';
import { ToastContainer } from './system/ui/ToastContainer';
import { initializeDemoNotifications } from './system/demo/NotificationDemo';
import { WindowXP } from './system/ui/WindowXP';
import './styles/tailwind.css';

function App() {
  const { settings } = useSettingsStore()
  const { isOverviewOpen } = useSessionStore()
  const { initialize } = useSimpleFileSystemStore()

  // Initialize filesystem and keyboard shortcuts
  useEffect(() => {
    initialize();
    
    // Initialize demo notifications
    initializeDemoNotifications();
    // Dev-only: check icon assets availability and log missing ones
    if ((import.meta as any).env?.DEV) {
      import('./system/ui/icons.dev-check').then(mod => mod.checkIconAssetsDev?.()).catch(() => {})
    }
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, altKey } = event
      
      // Super key (Windows key) for Overview
      if (key === 'Meta' || (key === 'Super')) {
        event.preventDefault()
        useSessionStore.getState().toggleOverview()
        return
      }

      // Alt+Tab for window switching
      if (altKey && key === 'Tab') {
        event.preventDefault()
        // TODO: Implement Alt+Tab window switcher
        return
      }

      // Alt+` for same-app window switching
      if (altKey && key === '`') {
        event.preventDefault()
        // TODO: Implement Alt+` same-app switcher
        return
      }

      // Ctrl+Alt+Arrow for workspace switching
      if (ctrlKey && altKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        event.preventDefault()
        const { workspaces, currentWorkspace, switchToWorkspace } = useSessionStore.getState()
        const currentIndex = workspaces.findIndex(w => w.id === currentWorkspace)
        
        if (key === 'ArrowLeft' && currentIndex > 0) {
          switchToWorkspace(workspaces[currentIndex - 1].id)
        } else if (key === 'ArrowRight' && currentIndex < workspaces.length - 1) {
          switchToWorkspace(workspaces[currentIndex + 1].id)
        }
        return
      }

      // Escape to close overview
      if (key === 'Escape' && isOverviewOpen) {
        event.preventDefault()
        useSessionStore.getState().closeOverview()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOverviewOpen, initialize])

  // Prevent context menu on right click (we'll handle it ourselves)
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement
    
    // Apply theme mode
    if (settings.theme.mode === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme.mode === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }

    // Apply high contrast
    root.classList.toggle('high-contrast', settings.theme.highContrast)

    // Apply font size
    const body = document.body
    body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xl')
    body.classList.add(`font-size-${settings.theme.fontSize}`)

    // Apply reduced motion
    if (settings.theme.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
    } else {
      root.style.removeProperty('--animation-duration')
    }

    // Apply accent color
    root.style.setProperty('--accent', settings.theme.accentColor)
  }, [settings])

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <Desktop />
      {/* XP sample window */}
      <WindowXP title="About daveOS XP Mode" initialPosition={{ x: 120, y: 120 }} initialSize={{ width: 480, height: 320 }}>
        <div style={{ padding: 12, fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif', fontSize: 12 }}>
          <p><strong>daveOS XP Mode</strong> — UI estilo Windows XP (Luna) 100% client-side.</p>
          <ul style={{ marginTop: 8, listStyle: 'disc', paddingLeft: 18 }}>
            <li>Taskbar + Start Menu</li>
            <li>Ventanas con chrome XP</li>
            <li>Desktop con iconos</li>
          </ul>
        </div>
      </WindowXP>
      <Taskbar />
      <WindowManager />
      <Overview />
      <ToastContainer />
      
      {/* Global Styles */}
      <style>{`
        /* Custom scrollbar styles */
        .slider {
          background: linear-gradient(to right, var(--accent) 0%, var(--accent) ${
            // This would be dynamic based on slider value
            '50%'
          }, var(--surface-border) ${
            '50%'
          }, var(--surface-border) 100%);
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Dock auto-hide styles */
        .dock-auto-hide {
          transform: translateX(-100%);
          transition: transform 0.3s ease-out;
        }
        
        .dock-auto-hide:hover {
          transform: translateX(0);
        }

        /* Focus styles for accessibility */
        .focus-ring:focus-visible {
          outline: none;
          ring: 2px;
          ring-color: var(--accent);
          ring-offset: 2px;
          ring-offset-color: var(--background);
        }

        /* High contrast mode adjustments */
        .high-contrast {
          --surface-border: currentColor;
        }
        
        .high-contrast .window {
          border-width: 2px;
        }
        
        .high-contrast .btn {
          border-width: 2px;
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App
