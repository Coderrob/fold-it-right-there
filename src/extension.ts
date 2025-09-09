/* eslint-disable @typescript-eslint/no-empty-function */
import * as vscode from 'vscode'

/**
 * Activates the VS Code extension.
 * Registers the folding range provider for all file schemes.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
  // Lazily load the real provider to avoid heavy native module initialization
  // during extension activation which can block the extension host.
  let realProvider: vscode.FoldingRangeProvider | undefined

  const wrapper: vscode.FoldingRangeProvider = {
    async provideFoldingRanges(document, context, token) {
      if (!realProvider) {
        // dynamic import so tree-sitter and grammars load only when needed
        const mod = await import('./function-folding.provider.js')
        // the class expects the runtime vscode object
        realProvider = new mod.FunctionFoldingProvider(vscode)
      }

      return realProvider.provideFoldingRanges(document, context, token)
    },
  }

  const disposable = vscode.languages.registerFoldingRangeProvider(
    { scheme: 'file' },
    wrapper
  )
  context.subscriptions.push(disposable)
}

/**
 * Deactivates the VS Code extension.
 * Currently does nothing.
 */
export function deactivate() {}
