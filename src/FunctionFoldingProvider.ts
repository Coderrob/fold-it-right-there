import vscode from 'vscode'
import Parser from 'tree-sitter'
import Rust from 'tree-sitter-rust'
import TypeScript from 'tree-sitter-typescript'

export class FunctionFoldingProvider implements vscode.FoldingRangeProvider {
  private parsers: Record<string, Parser>

  constructor() {
    this.parsers = {
      rust: new Parser(),
      typescript: new Parser(),
      javascript: new Parser(),
      // Add other languages and their parsers here
    }

    this.parsers['rust'].setLanguage(Rust)
    this.parsers['typescript'].setLanguage(TypeScript.typescript)
  }

  async provideFoldingRanges(
    document: vscode.TextDocument
    // context: vscode.FoldingContext,
    // token: vscode.CancellationToken
  ): Promise<vscode.FoldingRange[]> {
    const languageId = document.languageId
    const parser = this.parsers[languageId]

    if (!parser) {
      return []
    }

    const sourceCode = document.getText()
    const tree = parser.parse(sourceCode)
    const functionNodes = this.getFunctionNodes(tree.rootNode)

    return functionNodes.map((node) => {
      const startLine = node.startPosition.row
      const endLine = node.endPosition.row
      return new vscode.FoldingRange(
        startLine,
        endLine,
        vscode.FoldingRangeKind.Region
      )
    })
  }

  private getFunctionNodes(node: Parser.SyntaxNode): Parser.SyntaxNode[] {
    let functions: Parser.SyntaxNode[] = []

    if (this.isFunctionNode(node)) {
      functions.push(node)
    }

    for (const child of node.children) {
      functions = functions.concat(this.getFunctionNodes(child))
    }

    return functions
  }

  private isFunctionNode(node: Parser.SyntaxNode): boolean {
    const functionNodeTypes = [
      'function_item', // Rust
      'function_declaration', // TypeScript/JavaScript
      'method_definition', // TypeScript/JavaScript
      // Add other function node types here
    ]

    return functionNodeTypes.includes(node.type)
  }
}
