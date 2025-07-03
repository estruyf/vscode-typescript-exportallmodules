import * as vscode from "vscode";
import { getFilesRecursively } from "./util";
import * as path from "path";

// Mock vscode
jest.mock("vscode", () => ({
  workspace: {
    fs: {
      readDirectory: jest.fn(),
    },
  },
  FileType: {
    Directory: 2,
    File: 1,
  },
  Uri: {
    file: jest.fn((path) => ({ fsPath: path })),
  },
}));

// Mock getBarrelFiles
jest.mock("./getBarrelFiles", () => ({
  getBarrelFiles: () => ["index.ts", "index.tsx"],
}));

describe("getFilesRecursively", () => {
  const mockReadDirectory = vscode.workspace.fs.readDirectory as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should recursively find TypeScript files", async () => {
    const rootPath = "/test/components";
    
    // Mock the directory structure
    mockReadDirectory
      .mockResolvedValueOnce([
        ["button", vscode.FileType.Directory],
        ["textBox", vscode.FileType.Directory],
      ])
      .mockResolvedValueOnce([
        ["button.tsx", vscode.FileType.File],
        ["button.module.scss", vscode.FileType.File],
      ])
      .mockResolvedValueOnce([
        ["textBox.tsx", vscode.FileType.File],
        ["textBox.module.scss", vscode.FileType.File],
      ]);

    const result = await getFilesRecursively(
      vscode.Uri.file(rootPath),
      rootPath,
      [],
      []
    );

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        name: "button.tsx",
        relPath: path.join("button", "button.tsx"),
        absPath: path.join(rootPath, "button", "button.tsx"),
        type: "file",
      },
      {
        name: "textBox.tsx",
        relPath: path.join("textBox", "textBox.tsx"),
        absPath: path.join(rootPath, "textBox", "textBox.tsx"),
        type: "file",
      },
    ]);
  });

  it("should exclude files based on exclude patterns", async () => {
    const rootPath = "/test/components";
    
    mockReadDirectory
      .mockResolvedValueOnce([
        ["button", vscode.FileType.Directory],
      ])
      .mockResolvedValueOnce([
        ["button.tsx", vscode.FileType.File],
        ["button.test.tsx", vscode.FileType.File],
      ]);

    const result = await getFilesRecursively(
      vscode.Uri.file(rootPath),
      rootPath,
      [".test."],
      []
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("button.tsx");
  });
});