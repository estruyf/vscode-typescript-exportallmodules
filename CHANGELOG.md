# Change Log

## [2.10.0] 22-07-2024

- [#1](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/1): Add support for default named exports

## [2.9.2] 22-07-2024

- [#33](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/33): Fix enum named export

## [2.9.1] 12-07-2024

- [#31](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/31): Fix issue unable to resolve filesystem provider (thanks to [Mike Rheault](https://github.com/mrheault))

## [2.9.0] 03-07-2024

- [#30](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/30): Added the `Barrel Generator: Export all modules from the current file directory` command to generate a barrel file from the current file its directory

## [2.8.0] 03-07-2024

- Updates to use the `vscode.workspace.fs` API
- [#13](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/13) [#14](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/14): Added support for named exports (thanks to [Mike Rheault](https://github.com/mrheault))

## [2.7.0] 11-09-2023

- [#10](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/10): Wilcard support added
- [#23](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/23): Bundle the extension with ESBuild

## [2.6.0] 19-02-2023

- Created a submenu for the context menu items

## [2.5.0] 11-07-2022

- [#16](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/16): New `exportall.config.message` setting to specify a message that will be added at the top of the generated barrel file.

## [2.4.1] 20-06-2022

- Changed activation to `onStartupFinished`
- Fix for `date-fns` dependency

## [2.4.0] 20-06-2022

- Update to extension engine version `1.64.0` (January 2022) of VS Code
- [#12](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/12): Check if there are changes to be applied to the barrel file. If not, there is no need to update the barrel file.

## [2.3.2] 20-06-2022

- [#15](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/15): Fix for folder names with a dot notation

## [2.3.1] 07-02-2022

- [#4](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/4): Fix file path in `file` parsing

## [2.3.0] 07-02-2022

- [#4](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/4): Fix file and folder parsing on Windows
- [#8](https://github.com/estruyf/vscode-typescript-exportallmodules/pull/8): Exporting folders that contain a `index.tsx` file. Thanks to [
Robin Blomberg](https://github.com/RobinBlomberg).
- [#9](https://github.com/estruyf/vscode-typescript-exportallmodules/pull/9): Ability to specify which type of quotes to use when exporting. Thanks to [rveldpaus](https://github.com/rveldpaus).

## [2.2.0] 11-06-2021

- Added default save functionality from VS Code (Thanks to [yamaimo](https://github.com/yarnaimo))
- [#3](https://github.com/estruyf/vscode-typescript-exportallmodules/issues/3): Add an option about adding semis automatically

## [2.1.0] 15-10-2020

- Name change to TypeScript Barrel Generator

## [2.0.1] 08-06-2020

- Fixed merge

## [2.0.0] 08-06-2020

- Added the functionality to export options which contain a `index.ts` file
- Added the functionality to specify folders/files to be excluded from the export
- Run silently without always showing a message. Only on manual export you still get a message.

## [1.0.1] 04-06-2020

- Fix issues for the Windows file system

## [1.0.0] 02-06-2020

- Official release
