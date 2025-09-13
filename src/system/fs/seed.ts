import { FileSystemAPI } from './api';
import { FSEntryType, MimeType } from '../store/types';

export const seedFileSystem = async (): Promise<void> => {
  try {
    // Check if already seeded
    const root = await FileSystemAPI.getEntryByPath('/');
    if (root) {
      console.log('File system already seeded');
      return;
    }

    console.log('Seeding file system...');

    // Create root directory
    await FileSystemAPI.createEntry({
      name: '',
      type: FSEntryType.FOLDER,
      path: '/',
      parent: null,
      size: 0,
      mimeType: 'inode/directory' as MimeType
    });

    // Create home directory
    await FileSystemAPI.createFolder('home', '/');
    await FileSystemAPI.createFolder('user', '/home');

    // Create user directories
    const userDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Public'];
    for (const dir of userDirs) {
      await FileSystemAPI.createFolder(dir, '/home/user');
    }

    // Create system directories
    await FileSystemAPI.createFolder('usr', '/');
    await FileSystemAPI.createFolder('bin', '/usr');
    await FileSystemAPI.createFolder('share', '/usr');
    await FileSystemAPI.createFolder('applications', '/usr/share');

    // Create tmp directory
    await FileSystemAPI.createFolder('tmp', '/');

    // Create some sample files
    await FileSystemAPI.createFile(
      'Welcome.txt',
      `Welcome to daveOS!

This is a fully client-side WebOS built with React, TypeScript, and modern web technologies.

Features:
- Ubuntu-style UI with GNOME/Yaru theming
- File system with IndexedDB persistence
- Window management and workspaces
- Terminal with command support
- Built-in applications
- PWA support for offline use

Explore the system and enjoy!

Built with ❤️ using:
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Zustand for state management
- Dexie for database
- xterm.js for terminal

Version: 1.0.0
`,
      'text/plain' as MimeType,
      '/home/user/Desktop'
    );

    await FileSystemAPI.createFile(
      'README.md',
      `# daveOS

A modern WebOS built entirely in the browser.

## Getting Started

1. Click on Applications to see available apps
2. Use the terminal for command-line operations
3. Drag windows to move them around
4. Use Super key to open Activities overview
5. Right-click for context menus

## Keyboard Shortcuts

- **Super**: Open/close Activities
- **Alt+Tab**: Switch between windows
- **Ctrl+Alt+←/→**: Switch workspaces
- **F2**: Rename selected item
- **Delete**: Move to trash

Enjoy exploring daveOS!
`,
      'text/markdown' as MimeType,
      '/home/user/Documents'
    );

    // Create sample image placeholder
    await FileSystemAPI.createFile(
      'sample.svg',
      `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#E95420"/>
  <circle cx="100" cy="100" r="50" fill="white"/>
  <text x="100" y="110" text-anchor="middle" fill="#E95420" font-family="Ubuntu" font-size="16">daveOS</text>
</svg>`,
      'image/svg+xml' as MimeType,
      '/home/user/Pictures'
    );

    // Create sample script
    await FileSystemAPI.createFile(
      'hello.sh',
      `#!/bin/bash
echo "Hello from daveOS!"
echo "Current time: $(date)"
echo "System: WebOS v1.0"
`,
      'application/x-shellscript' as MimeType,
      '/home/user/Documents'
    );

    // Create configuration file
    await FileSystemAPI.createFile(
      'config.json',
      JSON.stringify({
        theme: 'ubuntu',
        language: 'en',
        timezone: 'UTC',
        shortcuts: {
          terminal: 'Ctrl+Alt+T',
          fileManager: 'Super+E',
          settings: 'Super+I'
        },
        dock: {
          position: 'left',
          size: 'medium',
          autohide: false
        }
      }, null, 2),
      'application/json' as MimeType,
      '/home/user'
    );

    console.log('File system seeded successfully');
  } catch (error) {
    console.error('Failed to seed file system:', error);
    throw error;
  }
};

export const createSampleFiles = async (): Promise<void> => {
  try {
    // Create additional sample files for testing
    const sampleFiles = [
      {
        name: 'notes.txt',
        content: 'My notes:\n\n- Learn React\n- Build awesome apps\n- Contribute to open source',
        mimeType: 'text/plain' as MimeType,
        path: '/home/user/Documents'
      },
      {
        name: 'todo.md',
        content: '# TODO List\n\n- [ ] Finish daveOS\n- [ ] Add more apps\n- [ ] Improve performance\n- [x] Create file system',
        mimeType: 'text/markdown' as MimeType,
        path: '/home/user/Documents'
      },
      {
        name: 'package.json',
        content: JSON.stringify({
          name: 'my-app',
          version: '1.0.0',
          description: 'A sample application',
          main: 'index.js',
          scripts: {
            start: 'node index.js',
            test: 'echo "No tests yet"'
          }
        }, null, 2),
        mimeType: 'application/json' as MimeType,
        path: '/home/user/Documents'
      }
    ];

    for (const file of sampleFiles) {
      await FileSystemAPI.createFile(file.name, file.content, file.mimeType, file.path);
    }

    console.log('Sample files created successfully');
  } catch (error) {
    console.error('Failed to create sample files:', error);
  }
};
