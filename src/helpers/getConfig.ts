import { workspace } from "vscode";
import {
  CONFIG_EXCLUDE,
  CONFIG_INCLUDE_FOLDERS,
  CONFIG_MESSAGE,
  CONFIG_NAMED_EXPORTS,
  CONFIG_QUOTE,
  CONFIG_RELATIVE_EXCLUDE,
  CONFIG_SEMIS,
  EXTENSION_KEY,
} from "../constants";
import { Config } from "../models";

export const getConfig = (): Config => {
  const config = workspace.getConfiguration(EXTENSION_KEY);
  const excludeFiles: string | undefined = config.get(CONFIG_EXCLUDE);
  const excludeRel: string | undefined = config.get(CONFIG_RELATIVE_EXCLUDE);
  const includeFolders: boolean | undefined = config.get(
    CONFIG_INCLUDE_FOLDERS
  );
  const namedExports: boolean | undefined = config.get(CONFIG_NAMED_EXPORTS);
  const semis: boolean | undefined = config.get(CONFIG_SEMIS);
  const quote: '"' | "'" = config.get(CONFIG_QUOTE) ?? "'";
  const message: string | string[] | undefined = config.get<string | string[]>(
    CONFIG_MESSAGE
  );

  return {
    excludeFiles,
    excludeRel,
    includeFolders,
    namedExports,
    semis,
    quote,
    message,
  };
};
