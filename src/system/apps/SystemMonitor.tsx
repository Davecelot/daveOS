import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi, 
  Battery,
  Thermometer,
  Activity,
  RefreshCw,
  Info,
  Zap
} from 'lucide-react';

interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  network: {
    download: number;
    upload: number;
    ping: number;
    connected: boolean;
  };
  battery: {
    level: number;
    charging: boolean;
    timeRemaining: number;
  };
  processes: Array<{
    name: string;
    pid: number;
    cpu: number;
    memory: number;
    status: string;
  }>;
}

interface SystemMonitorProps {
  windowId?: string;
  onClose?: () => void;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ onClose }) => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: { usage: 0, cores: 8, frequency: 2400, temperature: 45 },
    memory: { used: 0, total: 16384, available: 0, percentage: 0 },
    storage: { used: 0, total: 512000, available: 0, percentage: 0 },
    network: { download: 0, upload: 0, ping: 25, connected: true },
    battery: { level: 85, charging: false, timeRemaining: 240 },
    processes: []
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'network' | 'storage'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const [networkHistory, setNetworkHistory] = useState<{download: number[], upload: number[]}>({
    download: [],
    upload: []
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const maxHistoryPoints = 60;

  // Simulate system stats (in real implementation, this would use actual system APIs)
  const generateStats = (): SystemStats => {
    const cpuUsage = Math.random() * 100;
    const memoryUsed = 8192 + Math.random() * 4096;
    const memoryTotal = 16384;
    const storageUsed = 256000 + Math.random() * 50000;
    const storageTotal = 512000;
    
    return {
      cpu: {
        usage: cpuUsage,
        cores: 8,
        frequency: 2400 + Math.random() * 400,
        temperature: 40 + Math.random() * 20
      },
      memory: {
        used: memoryUsed,
        total: memoryTotal,
        available: memoryTotal - memoryUsed,
        percentage: (memoryUsed / memoryTotal) * 100
      },
      storage: {
        used: storageUsed,
        total: storageTotal,
        available: storageTotal - storageUsed,
        percentage: (storageUsed / storageTotal) * 100
      },
      network: {
        download: Math.random() * 1000,
        upload: Math.random() * 100,
        ping: 20 + Math.random() * 30,
        connected: Math.random() > 0.05
      },
      battery: {
        level: 70 + Math.random() * 30,
        charging: Math.random() > 0.7,
        timeRemaining: 180 + Math.random() * 120
      },
      processes: generateProcesses()
    };
  };

  const generateProcesses = () => {
    const processNames = [
      'System', 'Chrome', 'VSCode', 'Node.js', 'Discord', 'Spotify',
      'Windows Explorer', 'dwm.exe', 'winlogon.exe', 'svchost.exe',
      'firefox.exe', 'steam.exe', 'notepad.exe', 'calculator.exe'
    ];
    
    return processNames.map((name, index) => ({
      name,
      pid: 1000 + index * 100 + Math.floor(Math.random() * 100),
      cpu: Math.random() * 25,
      memory: Math.random() * 1024,
      status: Math.random() > 0.1 ? 'Running' : 'Sleeping'
    })).sort((a, b) => b.cpu - a.cpu);
  };

  const updateStats = () => {
    const newStats = generateStats();
    setStats(newStats);
    
    // Update history
    setCpuHistory(prev => [...prev.slice(-maxHistoryPoints + 1), newStats.cpu.usage]);
    setMemoryHistory(prev => [...prev.slice(-maxHistoryPoints + 1), newStats.memory.percentage]);
    setNetworkHistory(prev => ({
      download: [...prev.download.slice(-maxHistoryPoints + 1), newStats.network.download],
      upload: [...prev.upload.slice(-maxHistoryPoints + 1), newStats.network.upload]
    }));
  };

  useEffect(() => {
    updateStats();
    
    if (autoRefresh) {
      intervalRef.current = setInterval(updateStats, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const ProgressBar: React.FC<{ value: number; max: number; color?: string; label?: string }> = ({ 
    value, max, color = 'bg-blue-500', label 
  }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="w-full">
        {label && <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const MiniChart: React.FC<{ data: number[]; color?: string; height?: number }> = ({ 
    data, color = '#3b82f6', height = 40 
  }) => {
    if (data.length < 2) return <div style={{ height }} className="bg-gray-100 rounded" />;
    
    const max = Math.max(...data, 1);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="100%" height={height} className="rounded">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <polygon
          fill="url(#gradient)"
          points={`0,${height} ${points} 100,${height}`}
        />
      </svg>
    );
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* CPU */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium">CPU</h3>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {stats.cpu.usage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={stats.cpu.usage} max={100} color="bg-blue-500" />
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div>Cores: {stats.cpu.cores}</div>
          <div>Frequency: {stats.cpu.frequency.toFixed(0)} MHz</div>
          <div>Temperature: {stats.cpu.temperature.toFixed(1)}°C</div>
        </div>
        <div className="mt-3">
          <MiniChart data={cpuHistory} color="#3b82f6" />
        </div>
      </div>

      {/* Memory */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MemoryStick className="w-5 h-5 text-green-500" />
            <h3 className="font-medium">Memory</h3>
          </div>
          <span className="text-2xl font-bold text-green-600">
            {stats.memory.percentage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={stats.memory.used} max={stats.memory.total} color="bg-green-500" />
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div>Used: {formatBytes(stats.memory.used * 1024 * 1024)}</div>
          <div>Available: {formatBytes(stats.memory.available * 1024 * 1024)}</div>
          <div>Total: {formatBytes(stats.memory.total * 1024 * 1024)}</div>
        </div>
        <div className="mt-3">
          <MiniChart data={memoryHistory} color="#10b981" />
        </div>
      </div>

      {/* Storage */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium">Storage</h3>
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {stats.storage.percentage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={stats.storage.used} max={stats.storage.total} color="bg-purple-500" />
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div>Used: {formatBytes(stats.storage.used * 1024 * 1024)}</div>
          <div>Free: {formatBytes(stats.storage.available * 1024 * 1024)}</div>
          <div>Total: {formatBytes(stats.storage.total * 1024 * 1024)}</div>
        </div>
      </div>

      {/* Network */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-orange-500" />
            <h3 className="font-medium">Network</h3>
          </div>
          <div className={`w-3 h-3 rounded-full ${stats.network.connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Download:</span>
            <span className="font-medium">{stats.network.download.toFixed(1)} KB/s</span>
          </div>
          <div className="flex justify-between">
            <span>Upload:</span>
            <span className="font-medium">{stats.network.upload.toFixed(1)} KB/s</span>
          </div>
          <div className="flex justify-between">
            <span>Ping:</span>
            <span className="font-medium">{stats.network.ping.toFixed(0)} ms</span>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-500">Download</div>
          <MiniChart data={networkHistory.download} color="#f59e0b" height={30} />
          <div className="text-xs text-gray-500">Upload</div>
          <MiniChart data={networkHistory.upload} color="#ef4444" height={30} />
        </div>
      </div>

      {/* Battery */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Battery className="w-5 h-5 text-yellow-500" />
            <h3 className="font-medium">Battery</h3>
          </div>
          <span className="text-2xl font-bold text-yellow-600">
            {stats.battery.level.toFixed(0)}%
          </span>
        </div>
        <ProgressBar 
          value={stats.battery.level} 
          max={100} 
          color={stats.battery.level > 20 ? 'bg-yellow-500' : 'bg-red-500'} 
        />
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <span className={`font-medium ${stats.battery.charging ? 'text-green-600' : 'text-gray-600'}`}>
              {stats.battery.charging ? 'Charging' : 'Discharging'}
            </span>
            {stats.battery.charging && <Zap className="w-4 h-4 text-yellow-500" />}
          </div>
          <div>Time remaining: {formatTime(stats.battery.timeRemaining)}</div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium">System Info</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div>OS: daveOS WebOS</div>
          <div>Version: 1.0.0</div>
          <div>Uptime: {formatTime(Math.random() * 1440)}</div>
          <div>Architecture: x64</div>
          <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
        </div>
      </div>
    </div>
  );

  const renderProcesses = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium">Running Processes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Process</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">PID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CPU %</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Memory</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.processes.map((process, index) => (
              <tr key={process.pid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 text-sm font-medium">{process.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{process.pid}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`font-medium ${process.cpu > 10 ? 'text-red-600' : 'text-gray-600'}`}>
                    {process.cpu.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatBytes(process.memory * 1024 * 1024)}
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    process.status === 'Running' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {process.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-semibold">System Monitor</h1>
            </div>
            
            <div className="flex border border-gray-300 rounded">
              {(['overview', 'processes', 'network', 'storage'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-sm capitalize ${
                    activeTab === tab 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
            >
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
            </select>
            
            <button
              onClick={updateStats}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Refresh Now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'processes' && renderProcesses()}
        {activeTab === 'network' && (
          <div className="text-center text-gray-500 mt-20">
            Network details - Coming soon
          </div>
        )}
        {activeTab === 'storage' && (
          <div className="text-center text-gray-500 mt-20">
            Storage details - Coming soon
          </div>
        )}
      </div>
    </div>
  );
};
