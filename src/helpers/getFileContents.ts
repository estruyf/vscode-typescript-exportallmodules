import * as fs from "fs";
import * as path from "path";
import { ExportAll } from "../commands";

export const getFileContents = (filePath: string): string => {
  if (fs.lstatSync(filePath).isDirectory()) {
    for (const indexFile of ExportAll.barrelFiles) {
      const indexPath = path.join(filePath, indexFile);
      if (fs.existsSync(indexPath)) {
        return fs.readFileSync(indexPath, "utf8");
      }
    }
    return "";
  } else if (fs.lstatSync(filePath).isFile()) {
    return fs.readFileSync(filePath, "utf8");
  }
  return "";
};
