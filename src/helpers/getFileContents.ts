import { join } from "path";
import { fileExists, getBarrelFiles, readFile } from ".";
import { FileType, Uri, workspace } from "vscode";

export const getFileContents = async (
  filePath: string
): Promise<string | undefined> => {
  const stat = await workspace.fs.stat(Uri.file(filePath));
  if (stat.type === FileType.Directory) {
    const BarrelFiles = getBarrelFiles();
    for (const indexFile of BarrelFiles) {
      const indexPath = join(filePath, indexFile);
      if (await fileExists(indexPath)) {
        return await readFile(indexPath);
      }
    }
    return undefined;
  } else if (stat.type === FileType.File) {
    return await readFile(filePath);
  }
  return undefined;
};
