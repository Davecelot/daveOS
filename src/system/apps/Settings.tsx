import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Monitor,
  Palette,
  Volume2,
  Wifi,
  Shield,
  User,
  Bell,
  Keyboard,
  Mouse,
  Globe,
  Clock,
  HardDrive,
  Battery,
  Accessibility,
  Download,
  Info,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsData {
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    wallpaper: string;
    fontSize: number;
    animations: boolean;
  };
  display: {
    resolution: string;
    scaling: number;
    brightness: number;
    nightMode: boolean;
    nightModeSchedule: { start: string; end: string };
  };
  audio: {
    masterVolume: number;
    systemSounds: boolean;
    notificationSounds: boolean;
    microphoneVolume: number;
  };
  network: {
    wifi: boolean;
    autoConnect: boolean;
    proxy: string;
    dns: string;
  };
  privacy: {
    locationServices: boolean;
    analytics: boolean;
    crashReports: boolean;
    cookies: 'all' | 'necessary' | 'none';
  };
  notifications: {
    enabled: boolean;
    showOnLockScreen: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    doNotDisturb: boolean;
    dndSchedule: { start: string; end: string };
  };
  input: {
    keyboardLayout: string;
    keyRepeatRate: number;
    mouseSpeed: number;
    scrollDirection: 'natural' | 'traditional';
    touchpadGestures: boolean;
  };
  system: {
    language: string;
    region: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    autoUpdates: boolean;
    telemetry: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
    colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
}

interface SettingsProps {
  windowId?: string;
  onClose?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState('appearance');
  const [settings, setSettings] = useState<SettingsData>({
    appearance: {
      theme: 'light',
      accentColor: '#3b82f6',
      wallpaper: 'default',
      fontSize: 14,
      animations: true
    },
    display: {
      resolution: '1920x1080',
      scaling: 100,
      brightness: 80,
      nightMode: false,
      nightModeSchedule: { start: '22:00', end: '06:00' }
    },
    audio: {
      masterVolume: 70,
      systemSounds: true,
      notificationSounds: true,
      microphoneVolume: 50
    },
    network: {
      wifi: true,
      autoConnect: true,
      proxy: '',
      dns: '8.8.8.8'
    },
    privacy: {
      locationServices: false,
      analytics: false,
      crashReports: true,
      cookies: 'necessary'
    },
    notifications: {
      enabled: true,
      showOnLockScreen: false,
      soundEnabled: true,
      vibrationEnabled: true,
      doNotDisturb: false,
      dndSchedule: { start: '23:00', end: '07:00' }
    },
    input: {
      keyboardLayout: 'US',
      keyRepeatRate: 50,
      mouseSpeed: 50,
      scrollDirection: 'natural',
      touchpadGestures: true
    },
    system: {
      language: 'English',
      region: 'United States',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      autoUpdates: true,
      telemetry: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false,
      colorBlindness: 'none'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('daveOS-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('daveOS-settings', JSON.stringify(settings));
    setHasChanges(false);
    // In a real implementation, this would also apply the settings to the system
  };

  const resetSettings = () => {
    if (confirm('Reset all settings to default values?')) {
      localStorage.removeItem('daveOS-settings');
      window.location.reload();
    }
  };

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const categories = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'display', name: 'Display', icon: Monitor },
    { id: 'audio', name: 'Audio', icon: Volume2 },
    { id: 'network', name: 'Network', icon: Wifi },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'input', name: 'Input', icon: Keyboard },
    { id: 'system', name: 'System', icon: Globe },
    { id: 'accessibility', name: 'Accessibility', icon: Accessibility }
  ];

  const accentColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const Slider: React.FC<{ 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number; 
    step?: number;
    label?: string;
  }> = ({ value, onChange, min = 0, max = 100, step = 1, label }) => (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-500">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-500">{max}</span>
        <span className="text-sm font-medium w-12 text-right">{value}</span>
      </div>
    </div>
  );

  const Toggle: React.FC<{ 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    label: string;
    description?: string;
  }> = ({ checked, onChange, label, description }) => (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const Select: React.FC<{ 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string }[];
    label: string;
  }> = ({ value, onChange, options, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <Select
          value={settings.appearance.theme}
          onChange={(value) => updateSetting('appearance', 'theme', value)}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto (System)' }
          ]}
          label="Theme Mode"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Accent Color</h3>
        <div className="flex space-x-3">
          {accentColors.map(color => (
            <button
              key={color}
              onClick={() => updateSetting('appearance', 'accentColor', color)}
              className={`w-8 h-8 rounded-full border-2 ${
                settings.appearance.accentColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Slider
        value={settings.appearance.fontSize}
        onChange={(value) => updateSetting('appearance', 'fontSize', value)}
        min={12}
        max={20}
        label="Font Size"
      />

      <Toggle
        checked={settings.appearance.animations}
        onChange={(checked) => updateSetting('appearance', 'animations', checked)}
        label="Enable Animations"
        description="Show smooth transitions and effects"
      />
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <Select
        value={settings.display.resolution}
        onChange={(value) => updateSetting('display', 'resolution', value)}
        options={[
          { value: '1920x1080', label: '1920 × 1080 (Full HD)' },
          { value: '2560x1440', label: '2560 × 1440 (QHD)' },
          { value: '3840x2160', label: '3840 × 2160 (4K)' }
        ]}
        label="Resolution"
      />

      <Slider
        value={settings.display.scaling}
        onChange={(value) => updateSetting('display', 'scaling', value)}
        min={75}
        max={200}
        step={25}
        label="Display Scaling (%)"
      />

      <Slider
        value={settings.display.brightness}
        onChange={(value) => updateSetting('display', 'brightness', value)}
        label="Brightness"
      />

      <Toggle
        checked={settings.display.nightMode}
        onChange={(checked) => updateSetting('display', 'nightMode', checked)}
        label="Night Mode"
        description="Reduces blue light for better sleep"
      />

      {settings.display.nightMode && (
        <div className="grid grid-cols-2 gap-4 ml-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={settings.display.nightModeSchedule.start}
              onChange={(e) => updateSetting('display', 'nightModeSchedule', {
                ...settings.display.nightModeSchedule,
                start: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={settings.display.nightModeSchedule.end}
              onChange={(e) => updateSetting('display', 'nightModeSchedule', {
                ...settings.display.nightModeSchedule,
                end: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderAudioSettings = () => (
    <div className="space-y-6">
      <Slider
        value={settings.audio.masterVolume}
        onChange={(value) => updateSetting('audio', 'masterVolume', value)}
        label="Master Volume"
      />

      <Slider
        value={settings.audio.microphoneVolume}
        onChange={(value) => updateSetting('audio', 'microphoneVolume', value)}
        label="Microphone Volume"
      />

      <Toggle
        checked={settings.audio.systemSounds}
        onChange={(checked) => updateSetting('audio', 'systemSounds', checked)}
        label="System Sounds"
        description="Play sounds for system events"
      />

      <Toggle
        checked={settings.audio.notificationSounds}
        onChange={(checked) => updateSetting('audio', 'notificationSounds', checked)}
        label="Notification Sounds"
        description="Play sounds for notifications"
      />
    </div>
  );

  const renderNetworkSettings = () => (
    <div className="space-y-6">
      <Toggle
        checked={settings.network.wifi}
        onChange={(checked) => updateSetting('network', 'wifi', checked)}
        label="Wi-Fi"
        description="Enable wireless networking"
      />

      <Toggle
        checked={settings.network.autoConnect}
        onChange={(checked) => updateSetting('network', 'autoConnect', checked)}
        label="Auto-connect to known networks"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">DNS Server</label>
        <input
          type="text"
          value={settings.network.dns}
          onChange={(e) => updateSetting('network', 'dns', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="8.8.8.8"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Proxy Server</label>
        <input
          type="text"
          value={settings.network.proxy}
          onChange={(e) => updateSetting('network', 'proxy', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="proxy.example.com:8080"
        />
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Toggle
        checked={settings.privacy.locationServices}
        onChange={(checked) => updateSetting('privacy', 'locationServices', checked)}
        label="Location Services"
        description="Allow apps to access your location"
      />

      <Toggle
        checked={settings.privacy.analytics}
        onChange={(checked) => updateSetting('privacy', 'analytics', checked)}
        label="Analytics & Diagnostics"
        description="Share usage data to improve the system"
      />

      <Toggle
        checked={settings.privacy.crashReports}
        onChange={(checked) => updateSetting('privacy', 'crashReports', checked)}
        label="Crash Reports"
        description="Automatically send crash reports"
      />

      <Select
        value={settings.privacy.cookies}
        onChange={(value) => updateSetting('privacy', 'cookies', value)}
        options={[
          { value: 'all', label: 'Accept All Cookies' },
          { value: 'necessary', label: 'Necessary Cookies Only' },
          { value: 'none', label: 'Block All Cookies' }
        ]}
        label="Cookie Policy"
      />
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Toggle
        checked={settings.notifications.enabled}
        onChange={(checked) => updateSetting('notifications', 'enabled', checked)}
        label="Enable Notifications"
      />

      <Toggle
        checked={settings.notifications.showOnLockScreen}
        onChange={(checked) => updateSetting('notifications', 'showOnLockScreen', checked)}
        label="Show on Lock Screen"
      />

      <Toggle
        checked={settings.notifications.soundEnabled}
        onChange={(checked) => updateSetting('notifications', 'soundEnabled', checked)}
        label="Notification Sounds"
      />

      <Toggle
        checked={settings.notifications.doNotDisturb}
        onChange={(checked) => updateSetting('notifications', 'doNotDisturb', checked)}
        label="Do Not Disturb"
        description="Silence notifications during specified hours"
      />

      {settings.notifications.doNotDisturb && (
        <div className="grid grid-cols-2 gap-4 ml-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={settings.notifications.dndSchedule.start}
              onChange={(e) => updateSetting('notifications', 'dndSchedule', {
                ...settings.notifications.dndSchedule,
                start: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={settings.notifications.dndSchedule.end}
              onChange={(e) => updateSetting('notifications', 'dndSchedule', {
                ...settings.notifications.dndSchedule,
                end: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderInputSettings = () => (
    <div className="space-y-6">
      <Select
        value={settings.input.keyboardLayout}
        onChange={(value) => updateSetting('input', 'keyboardLayout', value)}
        options={[
          { value: 'US', label: 'US English' },
          { value: 'UK', label: 'UK English' },
          { value: 'ES', label: 'Spanish' },
          { value: 'FR', label: 'French' },
          { value: 'DE', label: 'German' }
        ]}
        label="Keyboard Layout"
      />

      <Slider
        value={settings.input.keyRepeatRate}
        onChange={(value) => updateSetting('input', 'keyRepeatRate', value)}
        label="Key Repeat Rate"
      />

      <Slider
        value={settings.input.mouseSpeed}
        onChange={(value) => updateSetting('input', 'mouseSpeed', value)}
        label="Mouse Speed"
      />

      <Select
        value={settings.input.scrollDirection}
        onChange={(value) => updateSetting('input', 'scrollDirection', value)}
        options={[
          { value: 'natural', label: 'Natural (Content moves with finger)' },
          { value: 'traditional', label: 'Traditional (Content moves opposite to finger)' }
        ]}
        label="Scroll Direction"
      />

      <Toggle
        checked={settings.input.touchpadGestures}
        onChange={(checked) => updateSetting('input', 'touchpadGestures', checked)}
        label="Touchpad Gestures"
        description="Enable multi-finger gestures"
      />
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Select
        value={settings.system.language}
        onChange={(value) => updateSetting('system', 'language', value)}
        options={[
          { value: 'English', label: 'English' },
          { value: 'Spanish', label: 'Español' },
          { value: 'French', label: 'Français' },
          { value: 'German', label: 'Deutsch' },
          { value: 'Portuguese', label: 'Português' }
        ]}
        label="Language"
      />

      <Select
        value={settings.system.region}
        onChange={(value) => updateSetting('system', 'region', value)}
        options={[
          { value: 'United States', label: 'United States' },
          { value: 'United Kingdom', label: 'United Kingdom' },
          { value: 'Canada', label: 'Canada' },
          { value: 'Australia', label: 'Australia' }
        ]}
        label="Region"
      />

      <Select
        value={settings.system.timeFormat}
        onChange={(value) => updateSetting('system', 'timeFormat', value)}
        options={[
          { value: '12h', label: '12-hour (AM/PM)' },
          { value: '24h', label: '24-hour' }
        ]}
        label="Time Format"
      />

      <Select
        value={settings.system.dateFormat}
        onChange={(value) => updateSetting('system', 'dateFormat', value)}
        options={[
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
        ]}
        label="Date Format"
      />

      <Toggle
        checked={settings.system.autoUpdates}
        onChange={(checked) => updateSetting('system', 'autoUpdates', checked)}
        label="Automatic Updates"
        description="Install updates automatically"
      />

      <Toggle
        checked={settings.system.telemetry}
        onChange={(checked) => updateSetting('system', 'telemetry', checked)}
        label="Telemetry"
        description="Send usage data to improve the system"
      />
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <Toggle
        checked={settings.accessibility.highContrast}
        onChange={(checked) => updateSetting('accessibility', 'highContrast', checked)}
        label="High Contrast"
        description="Increase contrast for better visibility"
      />

      <Toggle
        checked={settings.accessibility.largeText}
        onChange={(checked) => updateSetting('accessibility', 'largeText', checked)}
        label="Large Text"
        description="Use larger text throughout the system"
      />

      <Toggle
        checked={settings.accessibility.screenReader}
        onChange={(checked) => updateSetting('accessibility', 'screenReader', checked)}
        label="Screen Reader"
        description="Enable screen reader support"
      />

      <Toggle
        checked={settings.accessibility.reducedMotion}
        onChange={(checked) => updateSetting('accessibility', 'reducedMotion', checked)}
        label="Reduce Motion"
        description="Minimize animations and transitions"
      />

      <Select
        value={settings.accessibility.colorBlindness}
        onChange={(value) => updateSetting('accessibility', 'colorBlindness', value)}
        options={[
          { value: 'none', label: 'None' },
          { value: 'protanopia', label: 'Protanopia (Red-blind)' },
          { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
          { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
        ]}
        label="Color Blindness Filter"
      />
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeCategory) {
      case 'appearance': return renderAppearanceSettings();
      case 'display': return renderDisplaySettings();
      case 'audio': return renderAudioSettings();
      case 'network': return renderNetworkSettings();
      case 'privacy': return renderPrivacySettings();
      case 'notifications': return renderNotificationSettings();
      case 'input': return renderInputSettings();
      case 'system': return renderSystemSettings();
      case 'accessibility': return renderAccessibilitySettings();
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>
        
        <div className="p-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{category.name}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold capitalize">{activeCategory}</h2>
              <p className="text-gray-600 mt-1">
                Configure your {activeCategory} preferences
              </p>
            </div>
            
            <div className="flex space-x-2">
              {hasChanges && (
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              )}
              
              <button
                onClick={resetSettings}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderSettingsContent()}
        </div>
      </div>
    </div>
  );
};
