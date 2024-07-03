import { Uri, workspace } from "vscode";

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await workspace.fs.stat(Uri.file(filePath));
    return true;
  } catch (e) {
    return false;
  }
};
