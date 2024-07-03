import { TextEncoder } from "util";
import { Uri, workspace } from "vscode";

export const writeFile = async (
  filePath: string,
  content: string
): Promise<void> => {
  const encoder = new TextEncoder();
  await workspace.fs.writeFile(Uri.file(filePath), encoder.encode(content));
};
