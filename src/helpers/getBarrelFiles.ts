import { workspace } from "vscode";
import { CONFIG_BARREL_NAME, EXTENSION_KEY } from "../constants/Extension";

export function getBarrelFiles(): string[] {
  const BarrelFiles = ["index.ts", "index.tsx"];

  const config = workspace.getConfiguration(EXTENSION_KEY);
  const barrelName = config.get<string>(CONFIG_BARREL_NAME);

  if (barrelName) {
    return Array.from(new Set([...BarrelFiles, barrelName]));
  }

  return BarrelFiles;
}
