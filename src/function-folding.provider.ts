import type * as vscode from 'vscode'
import { FunctionNodeFinder, MinimalNode } from './function-node.finder.js'
import { ParserManager } from './parser.manager.js'

/**
 * Provides folding ranges for functions in supported languages using tree-sitter.
 * Implements the VS Code FoldingRangeProvider interface.
 */
export class FunctionFoldingProvider implements vscode.FoldingRangeProvider {
  private parserManager: ParserManager
  private vscodeImpl: typeof vscode

  private finder: FunctionNodeFinder

  /**
   * Creates a new FunctionFoldingProvider instance.
   * @param vscodeImpl The VS Code API implementation.
   * @param finder Optional custom FunctionNodeFinder instance.
   * @param parserManager Optional custom ParserManager instance.
   */
  constructor(
    vscodeImpl: typeof vscode,
    finder?: FunctionNodeFinder,
    parserManager?: ParserManager
  ) {
    this.parserManager = parserManager ?? new ParserManager()
    this.vscodeImpl = vscodeImpl
    this.finder = finder ?? new FunctionNodeFinder()
  }

  /**
   * Provides folding ranges for the given document.
   * @param document The VS Code text document.
   * @param context The folding context (unused).
   * @param token The cancellation token (unused).
   * @returns A promise that resolves to an array of folding ranges.
   */
  async provideFoldingRanges(
    document: vscode.TextDocument
  ): Promise<vscode.FoldingRange[]> {
    const languageId = document.languageId
    const parser = this.parserManager.getParser(languageId)

    if (!parser) return []

    try {
      const sourceCode = document.getText()
      const tree = parser.parse(sourceCode)
      const functionNodes = this.finder.findFunctionNodes(
        tree.rootNode as unknown as MinimalNode,
        languageId
      )
      return functionNodes.map(
        (node: MinimalNode) =>
          new this.vscodeImpl.FoldingRange(
            node.startPosition!.row,
            node.endPosition!.row,
            this.vscodeImpl.FoldingRangeKind.Region
          )
      )
    } catch {
      // If parsing fails for any reason, return empty; avoid throwing inside the provider
      return []
    }
  }

  // legacy helpers removed in favor of FunctionNodeFinder
}
