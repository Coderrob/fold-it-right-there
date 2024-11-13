/* eslint-disable @typescript-eslint/no-empty-function */
import vscode from 'vscode'
import { FunctionFoldingProvider } from './FunctionFoldingProvider'

export function activate(context: vscode.ExtensionContext) {
  const foldingProvider = new FunctionFoldingProvider()
  const disposable = vscode.languages.registerFoldingRangeProvider(
    { scheme: 'file' },
    foldingProvider
  )
  context.subscriptions.push(disposable)
}

export function deactivate() {}
