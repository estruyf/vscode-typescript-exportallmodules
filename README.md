<h1 align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-typescript-exportallmodules">
    <img alt="TypeScript Barrel Generator" src="./assets/export-all.png">
  </a>
</h1>

<h2 align="center">TypeScript Barrel Generator</h2>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-typescript-exportallmodules" title="Check it out on the Visual Studio Marketplace">
    <img src="https://vsmarketplacebadges.dev/version/eliostruyf.vscode-typescript-exportallmodules.svg" alt="Visual Studio Marketplace" style="display: inline-block" />
  </a>

  <img src="https://vsmarketplacebadges.dev/installs/eliostruyf.vscode-typescript-exportallmodules.svg" alt="Number of installs"  style="display: inline-block;margin-left:10px" />
  
  <img src="https://vsmarketplacebadges.dev/rating/eliostruyf.vscode-typescript-exportallmodules.svg" alt="Ratings" style="display: inline-block;margin-left:10px" />

  <a href="https://www.buymeacoffee.com/zMeFRy9" title="Buy me a coffee" style="margin-left:10px">
    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-€%203-blue?logo=buy-me-a-coffee&style=flat" alt="Buy me a coffee" style="display: inline-block" />
  </a>
</p>

## ❓ Why

Working with TypeScript? Want to make your TypeScript imports cleaner? Use this extension to easily export all modules to a barrel `index.ts` file.

> **Info**: A "barrel" is a way to rollup exports from several modules into a single convenient module. The barrel itself is a module file that re-exports selected exports of other modules.

Example:

```typescript
// folder/index.ts
export * from "./foo";
export * from "./bar";
```

## ✨ Functionalities

The extension allows you to manually or automatically export the modules to a barrel file. For the automatic way, you first have to create a listener for the folder for which you want to create the automated export.

In both the manual and automatic way, an `index.ts` file will be created with a reference to all the folder/files in the current directory.

> **Info**: If there are folders/files you want to get excluded from the export, you can do this by right-clicking on the folder/file and clicking on the `TypeScript: Exclude folder/file from export`.

### Create from the current file directory

By using the `Barrel Generator: Export all modules from the current file directory` command, you can create a barrel file from the current file path its directory.

> **Info**: If you want, you can add your own keybinding to this command to make it easier to trigger.

### Manual creation

<p align="center">
  <img src="./assets/manual-export.gif" alt="Manual module export" style="display: inline-block" />
</p>

### Module creation by listener

<p align="center">
  <img src="./assets/listener.gif" alt="Export listener" style="display: inline-block" />
</p>

> **Info**: When a folder listener is added, it will be visible in the `TypeScript - Export Listeners` view. By clicking on the folder names, you will automatically open the `index.ts` file.

#### Removing a listener

Folder listeners can be removed by right-clicking on the folder name in the `TypeScript - Export View`.

<p align="center">
  <img src="./assets/remove-listener.png" alt="Remove a folder listener" style="display: inline-block" />
</p>

### Excluding folder(s)/file(s)

If there are specific folders or files you want to exclude from your module, you can do this by right-clicking on the file, and click on the `TypeScript: Exclude folder/file from export` menu action.

<p align="center">
  <img src="./assets/exclude-folder.png" alt="Excluding folder" style="display: inline-block" />
</p>

<p align="center">
  <img src="./assets/exclude-file.png" alt="Excluding file" style="display: inline-block" />
</p>

#### Include previously excluded folder(s)/file(s)

When you already excluded a folder or file, and want to include these again into your module export, you can do this from the `TypeScript - Export View`. Under the `Excluded folders & files` section, right-click on the folder or file to include and click `Include to export`.

<p align="center">
  <img src="./assets/include-export.png" alt="Include to export" style="display: inline-block" />
</p>

### Customizing the Barrel File Name

By default, the barrel file is named `index.ts`. You can customize this name using the `exportall.config.barrelName` setting in your VS Code settings. For example:

```json
"exportall.config.barrelName": "barrel.ts"
```

This will generate a barrel file with the specified name instead of index.ts.

## ⚙️ Configuration / Settings

The extension makes use of the following settings:

| Setting                                   | Description                                                                                                                                                                                                                                                                                 | Type               | Default                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- |
| `exportall.config.namedExports`           | Specifies if you want to use named exports in the barrel file.                                                                                                                                                                                                                              | boolean            | `false`                |
| `exportall.config.includeFoldersToExport` | Specifies if folder (which contain a `index.ts` file) will also be included in the module export.                                                                                                                                                                                           | boolean            | `true`                 |
| `exportall.config.exclude`                | Specify which files you want to exclude the `index.ts` file. Works on the whole filename or part of the filename.                                                                                                                                                                           | string[]           | `['.test.', '.spec.']` |
| `exportall.config.folderListener`         | Specify the relative paths for the folder listeners. This will make it possible to automatically generate the module export once a file gets added/updated/removed within the specified folder.<br/><br/>To listen to sub-folders, you can include the directory wildcard `**` to the path. | string[]           | `[]`                   |
| `exportall.config.relExclusion`           | Specify the relative folder/file paths to exclude from the export.                                                                                                                                                                                                                          | `string[]`         | `[]`                   |
| `exportall.config.semis`                  | Specify if you want to enable/disable the usage of semis in the barrel file.                                                                                                                                                                                                                | `boolean`          | `true`                 |
| `exportall.config.quote`                  | Specify the character that you want to use as the quoting character; typically `'` or `"`.                                                                                                                                                                                                  | `string`           | `'`                    |
| `exportall.config.message`                | Specify the message that you want to use in the generated barrel file. The message will be added at the top.                                                                                                                                                                                | `string`           |                        |
| `exportall.config.exportFileExtension`    | Specify the file extension to append to the exported files. Example: `js`, `ts`, `null` (no extension).                                                                                                                                                                                     | `string` \| `null` | `null`                 |
| `exportall.config.barrelName`             | Specify the name of the barrel file.                                                                                                                                                                                                                                                        | `string`           | `index.ts`             |
| `exportall.config.exportFullPath`         | Specify if you want to use the full path in the export statement. This will be applied to the generated barrel file.                                                                                                                                                                        | `boolean`          | `false`                |

<p align="center">
  <img src="./assets/config.png" alt="Config settings example" style="display: inline-block" />
</p>

## 💪 Contribute

Experiencing any issues, or got feedback to share? Feel free to raise this in the issue list of the repo: [issues](https://github.com/estruyf/vscode-typescript-exportallmodules/issues).

<p align="center">
  <a href="https://github.com/estruyf/vscode-typescript-exportallmodules/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=estruyf/vscode-typescript-exportallmodules" alt="TypeScript Barrel Generator" />
  </a>
</p>

## 🔑 License

[MIT](./LICENSE)

<br />
<br />

<p align="center">
  <a href="https://github.com/sponsors/estruyf" title="Sponsor Elio Struyf" target="_blank">
    <img src="https://img.shields.io/badge/Sponsor-Elio%20Struyf%20%E2%9D%A4-%23fe8e86?logo=GitHub&style=flat-square" height="25px" alt="Sponsor @estruyf" />
  </a>
</p>

<br />

<p align="center">
  <a href="https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2Festruyf%2Fvscode-typescript-exportallmodules">
    <img src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Festruyf%2Fvscode-typescript-exportallmodules&countColor=%23263759" />
  </a>
</p>

<br />

<p align="center">
  <a href="https://struyfconsulting.com" title="Hire Elio Struyf via Struyf Consulting" target="_blank">
    <img src="./assets/struyf-consulting.webp" height="25px" alt="Struyf Consulting Logo" />
  </a>
</p>
