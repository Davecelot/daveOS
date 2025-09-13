import React, { useState, useEffect, useRef } from 'react'
import { Grid3X3, Settings, Volume2, Wifi, Bluetooth, Moon, Sun, Power, Bell, Battery } from 'lucide-react'
import { useSessionStore } from '../store/session'
import { useSettingsStore } from '../store/settings'
import { NotificationCenter, useNotifications } from './NotificationCenter'
import { CalendarPopover } from './CalendarPopover'

export function TopBar() {
  const { toggleOverview } = useSessionStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const { getUnreadCount } = useNotifications()
  const clockButtonRef = useRef<HTMLButtonElement>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const { settings } = useSettingsStore.getState()
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !settings.use24HourFormat,
      timeZone: settings.timezone
    }
    return date.toLocaleTimeString(settings.language, options)
  }

  const formatDate = (date: Date) => {
    const { settings } = useSettingsStore.getState()
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: settings.timezone
    }
    return date.toLocaleDateString(settings.language, options)
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-9 bg-black bg-opacity-40 backdrop-blur-md text-white flex items-center justify-between px-4 z-50 text-sm font-ubuntu">
      {/* Left Section - Activities */}
      <div className="flex items-center">
        <button
          className="px-3 py-1.5 text-sm font-medium hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200"
          onClick={toggleOverview}
        >
          Activities
        </button>
      </div>

      {/* Center Section - Clock */}
      <div className="flex items-center relative">
        <button
          ref={clockButtonRef}
          className="text-center hover:bg-white hover:bg-opacity-20 rounded-md px-3 py-1.5 transition-all duration-200"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <div className="text-sm font-medium leading-tight">{formatTime(currentTime)}</div>
          <div className="text-xs opacity-80 leading-tight">{formatDate(currentTime)}</div>
        </button>
        
        {/* Calendar Popover */}
        <CalendarPopover 
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          anchorElement={clockButtonRef.current}
        />
      </div>

      {/* Right Section - System Indicators */}
      <div className="flex items-center space-x-1">
        {/* System Indicators */}
        <div className="flex items-center space-x-1 mr-2">
          <SystemIndicator icon={<Wifi size={14} />} active={true} />
          <SystemIndicator icon={<Bluetooth size={14} />} active={false} />
          <SystemIndicator icon={<Volume2 size={14} />} active={true} />
          <BatteryIndicator level={85} />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={14} />
            {getUnreadCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
              </span>
            )}
          </button>
        </div>

        {/* Quick Settings Caret */}
        <button
          className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200 text-white opacity-80 hover:opacity-100"
          onClick={() => setShowQuickSettings(!showQuickSettings)}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Quick Settings Panel */}
        {showQuickSettings && (
          <QuickSettingsPanel onClose={() => setShowQuickSettings(false)} />
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  )
}

function QuickSettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, setThemeMode } = useSettingsStore()

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById('quick-settings-panel')
      if (panel && !panel.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const toggleDarkMode = () => {
    const newMode = settings.theme.mode === 'dark' ? 'light' : 'dark'
    setThemeMode(newMode)
  }

  return (
    <div
      id="quick-settings-panel"
      className="absolute top-full right-0 mt-2 w-80 bg-surface border border-surface-border rounded-ubuntu shadow-ubuntu-lg z-modal animate-fade-in"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Quick Settings</h3>
          <button
            className="text-foreground-muted hover:text-foreground transition-smooth"
            onClick={onClose}
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <QuickToggle
            icon={<Wifi size={20} />}
            label="Wi-Fi"
            active={true}
            onClick={() => {/* Mock toggle */}}
          />
          <QuickToggle
            icon={<Bluetooth size={20} />}
            label="Bluetooth"
            active={false}
            onClick={() => {/* Mock toggle */}}
          />
          <QuickToggle
            icon={settings.theme.mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            label={settings.theme.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            active={settings.theme.mode === 'dark'}
            onClick={toggleDarkMode}
          />
          <QuickToggle
            icon={<Grid3X3 size={20} />}
            label="Do Not Disturb"
            active={false}
            onClick={() => {/* Mock toggle */}}
          />
        </div>

        {/* Sliders */}
        <div className="space-y-3 mb-4">
          <QuickSlider
            icon={<Volume2 size={16} />}
            label="Volume"
            value={75}
            onChange={() => {/* Mock slider */}}
          />
          <QuickSlider
            icon={<Sun size={16} />}
            label="Brightness"
            value={60}
            onChange={() => {/* Mock slider */}}
          />
        </div>

        {/* Power Options */}
        <div className="border-t border-surface-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Power</span>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-surface-hover rounded-ubuntu transition-smooth text-foreground-muted hover:text-foreground">
                Lock
              </button>
              <button className="p-2 hover:bg-surface-hover rounded-ubuntu transition-smooth text-foreground-muted hover:text-foreground">
                Logout
              </button>
              <button className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-ubuntu transition-smooth">
                <Power size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickToggle({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`p-3 rounded-ubuntu border transition-smooth focus-ring ${
        active 
          ? 'bg-accent text-accent-foreground border-accent' 
          : 'bg-surface hover:bg-surface-hover border-surface-border'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center space-y-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
    </button>
  )
}

function QuickSlider({
  icon,
  label,
  value,
  onChange
}: {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-foreground-muted">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm">{label}</span>
          <span className="text-xs text-foreground-muted">{value}%</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-surface-border rounded-full appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  )
}

function SystemIndicator({ icon, active }: { icon: React.ReactNode, active: boolean }) {
  return (
    <div className={`p-1 transition-all duration-200 ${active ? 'text-white opacity-100' : 'text-white opacity-40'}`}>
      {icon}
    </div>
  )
}

function BatteryIndicator({ level }: { level: number }) {
  const getBatteryIcon = () => {
    if (level > 75) return <Battery size={14} className="text-green-400" />
    if (level > 50) return <Battery size={14} className="text-yellow-400" />
    if (level > 25) return <Battery size={14} className="text-orange-400" />
    return <Battery size={14} className="text-red-400" />
  }

  return (
    <div className="flex items-center space-x-1 text-white opacity-90">
      {getBatteryIcon()}
      <span className="text-xs">{level}%</span>
    </div>
  )
}
