export interface FileOrFolderToExport {
  name: string;
  absPath: string;
  relPath: string;
  type: "file" | "folder";
}
