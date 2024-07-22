import type { Node } from "typescript";

export const isDefaultExport = (node: Node) => {
  return node.getText().startsWith("export default");
};
