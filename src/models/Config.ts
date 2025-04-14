export interface Config {
  excludeFiles: string | undefined;
  excludeRel: string | undefined;
  includeFolders: boolean | undefined;
  namedExports: boolean | undefined;
  semis: boolean | undefined;
  quote: '"' | "'";
  message: string | string[] | undefined;
  fileExtension: string | null | undefined;
  barrelName: string | null | undefined;
  exportFullPath: boolean | undefined;
}
