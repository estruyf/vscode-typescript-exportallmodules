export const EXTENSION_KEY = 'exportall';
export const CONFIG_FOLDERS = 'config.folderListener';
export const CONFIG_EXCLUDE = 'config.exclude';
export const CONFIG_RELATIVE_EXCLUDE = 'config.relExclusion';
export const CONFIG_INCLUDE_FOLDERS = 'config.includeFoldersToExport';
export const CONFIG_SEMIS = 'config.semis';
export const CONFIG_QUOTE = 'config.quote';

export const COMMAND_KEYS = {
  Generate: "generate",
  Open: "open",
  AddFolder: "addFolder",
  RemoveFolder: "removeFolder",
  ExcludeFolder: "excludeFolder",
  ExcludeFile: "excludeFile",
  Include: "includeFolderFile",
  RefreshView: "refreshView"
};

export const getSettingName = (name: string) => {
  return `${EXTENSION_KEY}.${name}`;
};

export const getCommandName = (command: string) => {
  return `${EXTENSION_KEY}.${command}`;
};