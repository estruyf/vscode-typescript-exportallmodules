import { parseFileForNamedExports } from "./parseFileForNamedExports";
jest.mock("vscode");

describe("parseFileForNamedExports", () => {
  it("should return an empty object when fileContents is empty", () => {
    const fileContents = "";
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual([]);
    expect(result.typeExports).toEqual([]);
  });

  it("should correctly parse named exports", () => {
    const fileContents = `
      export const foo = "foo";
      export function bar() {}
      export class Baz {}
      export enum Quux {}
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["foo", "bar", "Baz", "Quux"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should correctly parse type exports", () => {
    const fileContents = `
      export type MyType = number;
      export interface MyInterface {}
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual([]);
    expect(result.typeExports).toEqual(["MyType", "MyInterface"]);
  });

  it("should correctly parse named exports with export specifier", () => {
    const fileContents = `
      export { foo, bar } from "./otherFile";
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["foo", "bar"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should correctly parse named exports with as keywork in export specifier", () => {
    const fileContents = `
      export { foo as fooBar, bar as barFoo } from "./otherFile";
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["fooBar", "barFoo"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should correctly parse default export with filename", () => {
    const fileContents = `
      export default function() {}
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["default as test"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should correctly parse named exports with default export", () => {
    const fileContents = `
      export default function getText () {}
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["default as getText"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should correctly parse named and type exports", () => {
    const fileContents = `
      export const foo = "foo";
      export type MyType = number;
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["foo"]);
    expect(result.typeExports).toEqual(["MyType"]);
  });

  it("should not include named or type exports that are not exported", () => {
    const fileContents = `
      const foo = "foo";
      type MyType = number;
      interface MyInterface {}
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual([]);
    expect(result.typeExports).toEqual([]);
  });

  it("should export the arrow function as named export", () => {
    const fileContents = `
      export const foo = () => {};
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["foo"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should export the class method as named export", () => {
    const fileContents = `
      export class Foo {
        bar() {}
      }
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["Foo"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should export the default class method as named export", () => {
    const fileContents = `
      export default class Foo {
        bar() {}
      }
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["default as Foo"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should export the default class without name as default with filename", () => {
    const fileContents = `
      export default class {
        bar() {}
      }
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual(["default as test"]);
    expect(result.typeExports).toEqual([]);
  });

  it("should export the default interface as type export", () => {
    const fileContents = `
      export default interface Foo {}
    `;
    const filename = "test";
    const result = parseFileForNamedExports(fileContents, filename);
    expect(result.namedExports).toEqual([]);
    expect(result.typeExports).toEqual(["default as Foo"]);
  });
});
