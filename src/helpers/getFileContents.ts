import * as fs from 'fs';
import * as path from 'path';

export const getFileContents = (filePath: string): string => {
  const barrelFiles = ['index.ts', 'index.tsx'];
  if (fs.lstatSync(filePath).isDirectory()) {
    for (const indexFile of barrelFiles) {
      const indexPath = path.join(filePath, indexFile);
      if (fs.existsSync(indexPath)) {
        return fs.readFileSync(indexPath, 'utf8');
      }
    }
    return '';
  } else if (fs.lstatSync(filePath).isFile()) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return '';
};
