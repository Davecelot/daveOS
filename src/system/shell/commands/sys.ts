export const XP_VER_BANNER = String.raw`
  ____              __      ____   ____   __  __
 |  _ \  __ _  ___ / _| ___|  _ \ / ___| |  \/  |  XP MODE
 | | | |/ _\` |/ __| |_ / _ \ | | |\___ \ | |\/| |
 | |_| | (_| | (__|  _|  __/ |_| | ___) || |  | |
 |____/ \__,_|\___|_|  \___|____/ |____/ |_|  |_|

 daveOS XP Mode [Version 5.1.2600]
 (C) 2025 daveOS. All rights reserved.
`;

export function ver(_args: string[]): string {
  return XP_VER_BANNER;
}

export function help(_args: string[]): string {
  return `
daveOS XP Mode Command Prompt

Available commands:
  CLS          Clear the screen
  CD           Display or change the current directory
  DIR          Display directory contents
  TYPE         Display file contents
  COPY         Copy files
  MOVE         Move files
  DEL          Delete files
  MKDIR        Create a directory
  RMDIR        Remove a directory
  REN          Rename a file or directory
  ECHO         Display a message
  DATE         Display or set the date
  TIME         Display or set the time
  VER          Display version information
  HELP         Display this help message
  START        Start a program or open a file
  RUN          Run a program
  EXIT         Exit the command prompt

Type "command /?" for more information about a specific command.
`;
}
