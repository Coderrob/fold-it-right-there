import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
  test('provide folding ranges (smoke)', async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: 'typescript',
      content: 'function hello() {\n}\n',
    })
    await vscode.window.showTextDocument(doc)

    const ranges = await vscode.commands.executeCommand(
      'vscode.provideFoldingRanges',
      doc.uri
    )
    // ranges should be an array (may be empty)
    assert.ok(Array.isArray(ranges))
  })
})
