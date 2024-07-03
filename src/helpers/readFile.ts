import { TextDecoder } from "util";
import { Uri, workspace } from "vscode";

export const readFile = async (
  filePath: string
): Promise<string | undefined> => {
  const file = await workspace.fs.readFile(Uri.file(filePath));
  if (!file) {
    return undefined;
  }

  return new TextDecoder().decode(file);
};
