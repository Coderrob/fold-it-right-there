/**
 * Minimal representation of a tree-sitter node for folding purposes.
 */
export interface MinimalNode {
  type: string
  children?: MinimalNode[]
  startPosition?: { row: number }
  endPosition?: { row: number }
}

/**
 * Predicate function for matching nodes.
 */
export type NodePredicate = (n: MinimalNode) => boolean

/**
 * Finds function nodes in a tree-sitter tree for supported languages.
 */
export class FunctionNodeFinder {
  private functionNodeTypes: Record<string, string[]>
  private predicates?: Record<string, NodePredicate>

  /**
   * Creates a new FunctionNodeFinder instance.
   * @param functionNodeTypes Optional mapping of language IDs to node types.
   * @param predicates Optional mapping of language IDs to predicate functions.
   */
  constructor(
    functionNodeTypes?: Record<string, string[]>,
    predicates?: Record<string, NodePredicate>
  ) {
    this.functionNodeTypes = functionNodeTypes ?? {
      rust: ['function_item'],
      typescript: ['function_declaration', 'method_definition'],
      javascript: ['function_declaration', 'method_definition'],
    }

    this.predicates = predicates
  }

  /**
   * Finds all function nodes in the given tree for the specified language.
   * @param root The root node of the tree-sitter tree.
   * @param languageId The language ID (e.g., 'typescript', 'rust').
   * @returns An array of MinimalNode representing function nodes.
   */
  findFunctionNodes(root: MinimalNode, languageId: string): MinimalNode[] {
    const builtinTypes = this.functionNodeTypes[languageId]
    const predicate = this.predicates?.[languageId]

    if (!builtinTypes && !predicate) return []

    const result: MinimalNode[] = []
    const stack: MinimalNode[] = [root]

    while (stack.length) {
      const node = stack.pop()!

      const matchesType = builtinTypes
        ? builtinTypes.includes(node.type)
        : false
      const matchesPred = predicate ? predicate(node) : false

      if (matchesType || matchesPred) result.push(node)

      if (node.children && node.children.length) {
        for (let i = node.children.length - 1; i >= 0; i--)
          stack.push(node.children[i])
      }
    }

    return result
  }
}
