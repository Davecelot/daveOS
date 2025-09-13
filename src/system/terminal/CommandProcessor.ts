import { SimpleFileSystemAPI } from '../fs/simple-api';
import { FSEntryType } from '../store/types';

export class CommandProcessor {
  private currentPath: string;
  private onPathChange: (path: string) => void;
  private writeOutput: (output: string) => void;
  private environment: Record<string, string> = {
    USER: 'user',
    HOME: '/home/user',
    PATH: '/usr/bin:/bin',
    SHELL: '/bin/bash',
    TERM: 'xterm-256color'
  };

  constructor(
    initialPath: string,
    setCurrentPath: (path: string) => void,
    writeOutput: (output: string) => void
  ) {
    this.currentPath = initialPath;
    this.onPathChange = setCurrentPath;
    this.writeOutput = writeOutput;
  }

  public setCurrentPath(path: string) {
    this.currentPath = path;
    if (this.onPathChange) {
      this.onPathChange(path);
    }
  }

  async execute(command: string): Promise<void> {
    const trimmed = command.trim();
    if (!trimmed) return;

    const parts = this.parseCommand(trimmed);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          await this.help();
          break;
        case 'ls':
          await this.ls(args);
          break;
        case 'cd':
          await this.cd(args);
          break;
        case 'pwd':
          await this.pwd();
          break;
        case 'cat':
          await this.cat(args);
          break;
        case 'mkdir':
          await this.mkdir(args);
          break;
        case 'touch':
          await this.touch(args);
          break;
        case 'rm':
          await this.rm(args);
          break;
        case 'clear':
          await this.clear();
          break;
        case 'echo':
          await this.echo(args);
          break;
        case 'whoami':
          await this.whoami();
          break;
        case 'date':
          await this.date();
          break;
        case 'uname':
          await this.uname(args);
          break;
        case 'env':
          await this.env();
          break;
        case 'history':
          await this.history();
          break;
        default:
          this.writeOutput(`\x1b[1;31mCommand not found: ${cmd}\x1b[0m\r\n`);
          this.writeOutput(`Type \x1b[1;33mhelp\x1b[0m to see available commands.\r\n`);
      }
    } catch (error) {
      this.writeOutput(`\x1b[1;31mError: ${(error as Error).message}\x1b[0m\r\n`);
    }
  }

  private parseCommand(command: string): string[] {
    // Simple command parsing - can be enhanced for quotes, pipes, etc.
    return command.split(/\s+/).filter(part => part.length > 0);
  }

  private async help(): Promise<void> {
    this.writeOutput('\x1b[1;36mAvailable Commands:\x1b[0m\r\n');
    this.writeOutput('\r\n');
    this.writeOutput('\x1b[1;33mFile System:\x1b[0m\r\n');
    this.writeOutput('  \x1b[32mls\x1b[0m [path]     - List directory contents\r\n');
    this.writeOutput('  \x1b[32mcd\x1b[0m <path>     - Change directory\r\n');
    this.writeOutput('  \x1b[32mpwd\x1b[0m           - Print working directory\r\n');
    this.writeOutput('  \x1b[32mcat\x1b[0m <file>    - Display file contents\r\n');
    this.writeOutput('  \x1b[32mmkdir\x1b[0m <name>  - Create directory\r\n');
    this.writeOutput('  \x1b[32mtouch\x1b[0m <name>  - Create empty file\r\n');
    this.writeOutput('  \x1b[32mrm\x1b[0m <name>     - Remove file or directory\r\n');
    this.writeOutput('\r\n');
    this.writeOutput('\x1b[1;33mSystem:\x1b[0m\r\n');
    this.writeOutput('  \x1b[32mclear\x1b[0m         - Clear terminal screen\r\n');
    this.writeOutput('  \x1b[32mecho\x1b[0m <text>   - Display text\r\n');
    this.writeOutput('  \x1b[32mwhoami\x1b[0m       - Display current user\r\n');
    this.writeOutput('  \x1b[32mdate\x1b[0m          - Display current date and time\r\n');
    this.writeOutput('  \x1b[32muname\x1b[0m [-a]     - Display system information\r\n');
    this.writeOutput('  \x1b[32menv\x1b[0m           - Display environment variables\r\n');
    this.writeOutput('  \x1b[32mhistory\x1b[0m       - Display command history\r\n');
    this.writeOutput('  \x1b[32mhelp\x1b[0m          - Show this help message\r\n');
    this.writeOutput('\r\n');
  }

  private async ls(args: string[]): Promise<void> {
    const targetPath = args.length > 0 ? this.resolvePath(args[0]) : this.currentPath;
    
    try {
      const entries = await SimpleFileSystemAPI.getEntries(targetPath);
      
      if (entries.length === 0) {
        return;
      }

      // Sort entries: directories first, then files, alphabetically
      const sorted = entries.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === FSEntryType.FOLDER ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      for (const entry of sorted) {
        const color = entry.type === FSEntryType.FOLDER ? '\x1b[1;34m' : '\x1b[0m';
        const icon = entry.type === FSEntryType.FOLDER ? '📁' : '📄';
        const suffix = entry.type === FSEntryType.FOLDER ? '/' : '';
        
        this.writeOutput(`${icon} ${color}${entry.name}${suffix}\x1b[0m\r\n`);
      }
    } catch (error) {
      this.writeOutput(`\x1b[1;31mls: cannot access '${targetPath}': No such file or directory\x1b[0m\r\n`);
    }
  }

  private async cd(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.currentPath = this.environment.HOME;
      this.setCurrentPath(this.currentPath);
      return;
    }

    const targetPath = this.resolvePath(args[0]);
    
    try {
      const entries = await SimpleFileSystemAPI.getEntries(targetPath);
      // If we can get entries, the path exists and is a directory
      this.currentPath = targetPath;
      this.setCurrentPath(this.currentPath);
    } catch (error) {
      this.writeOutput(`\x1b[1;31mcd: ${targetPath}: No such file or directory\x1b[0m\r\n`);
    }
  }

  private async pwd(): Promise<void> {
    this.writeOutput(`${this.currentPath}\r\n`);
  }

  private async cat(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.writeOutput('\x1b[1;31mcat: missing file operand\x1b[0m\r\n');
      return;
    }

    const filePath = this.resolvePath(args[0]);
    
    try {
      // Get all entries in the parent directory
      const parentPath = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
      const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
      
      const entries = await SimpleFileSystemAPI.getEntries(parentPath);
      const file = entries.find(entry => entry.name === fileName && entry.type === FSEntryType.FILE);
      
      if (!file) {
        this.writeOutput(`\x1b[1;31mcat: ${filePath}: No such file or directory\x1b[0m\r\n`);
        return;
      }

      if (file.content) {
        this.writeOutput(file.content + '\r\n');
      }
    } catch (error) {
      this.writeOutput(`\x1b[1;31mcat: ${filePath}: No such file or directory\x1b[0m\r\n`);
    }
  }

  private async mkdir(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.writeOutput('\x1b[1;31mmkdir: missing operand\x1b[0m\r\n');
      return;
    }

    const dirName = args[0];
    
    try {
      const success = await SimpleFileSystemAPI.createFolder(dirName, this.currentPath);
      if (!success) {
        this.writeOutput(`\x1b[1;31mmkdir: cannot create directory '${dirName}': File exists\x1b[0m\r\n`);
      }
    } catch (error) {
      this.writeOutput(`\x1b[1;31mmkdir: cannot create directory '${dirName}': ${(error as Error).message}\x1b[0m\r\n`);
    }
  }

  private async touch(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.writeOutput('\x1b[1;31mtouch: missing file operand\x1b[0m\r\n');
      return;
    }

    const fileName = args[0];
    
    try {
      const success = await SimpleFileSystemAPI.createFile(fileName, '', this.currentPath);
      if (!success) {
        this.writeOutput(`\x1b[1;31mtouch: cannot create file '${fileName}': File exists\x1b[0m\r\n`);
      }
    } catch (error) {
      this.writeOutput(`\x1b[1;31mtouch: cannot create file '${fileName}': ${(error as Error).message}\x1b[0m\r\n`);
    }
  }

  private async rm(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.writeOutput('\x1b[1;31mrm: missing operand\x1b[0m\r\n');
      return;
    }

    const targetName = args[0];
    
    try {
      const entries = await SimpleFileSystemAPI.getEntries(this.currentPath);
      const target = entries.find(entry => entry.name === targetName);
      
      if (!target) {
        this.writeOutput(`\x1b[1;31mrm: cannot remove '${targetName}': No such file or directory\x1b[0m\r\n`);
        return;
      }

      const success = await SimpleFileSystemAPI.deleteEntry(target.id!.toString());
      if (!success) {
        this.writeOutput(`\x1b[1;31mrm: cannot remove '${targetName}'\x1b[0m\r\n`);
      }
    } catch (error) {
      this.writeOutput(`\x1b[1;31mrm: cannot remove '${targetName}': ${(error as Error).message}\x1b[0m\r\n`);
    }
  }

  private async clear(): Promise<void> {
    this.writeOutput('\x1b[2J\x1b[H');
  }

  private async echo(args: string[]): Promise<void> {
    const text = args.join(' ');
    this.writeOutput(text + '\r\n');
  }

  private async whoami(): Promise<void> {
    this.writeOutput(`${this.environment.USER}\r\n`);
  }

  private async date(): Promise<void> {
    const now = new Date();
    this.writeOutput(`${now.toString()}\r\n`);
  }

  private async uname(args: string[]): Promise<void> {
    if (args.includes('-a')) {
      this.writeOutput('daveOS 1.0.0 WebOS x86_64 GNU/Linux\r\n');
    } else {
      this.writeOutput('daveOS\r\n');
    }
  }

  private async env(): Promise<void> {
    for (const [key, value] of Object.entries(this.environment)) {
      this.writeOutput(`${key}=${value}\r\n`);
    }
  }

  private async history(): Promise<void> {
    this.writeOutput('Command history is managed by the terminal component.\r\n');
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    
    if (path === '..') {
      const parts = this.currentPath.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }
    
    if (path === '.') {
      return this.currentPath;
    }
    
    if (path.startsWith('./')) {
      return this.currentPath + '/' + path.slice(2);
    }
    
    if (path.startsWith('../')) {
      const parts = this.currentPath.split('/').filter(p => p);
      const pathParts = path.split('/');
      
      for (const part of pathParts) {
        if (part === '..') {
          parts.pop();
        } else if (part !== '.') {
          parts.push(part);
        }
      }
      
      return '/' + parts.join('/');
    }
    
    return this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
  }
}
