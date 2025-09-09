import Parser from 'tree-sitter'
import Rust from 'tree-sitter-rust'
import TypeScript from 'tree-sitter-typescript'
import { FunctionNodeFinder, MinimalNode } from '../functionNodeFinder.js'
import { FunctionFoldingProvider } from '../functionFoldingProvider.js'
import { ParserManager } from '../parserManager.js'
import type * as vscode from 'vscode'
import type ParserType from 'tree-sitter'
import assert from 'assert'

describe('FunctionFoldingProvider', () => {
  const finder = new FunctionNodeFinder()

  describe('FunctionNodeFinder integration (used by provider)', () => {
    const rustParser = new Parser()
    rustParser.setLanguage(Rust)

    const tsParser = new Parser()
    tsParser.setLanguage(TypeScript.typescript)

    const testCases = [
      // Positive test cases
      {
        language: 'rust',
        code: 'fn my_function() {}',
        nodeType: 'function_item',
        expected: true,
      },
      {
        language: 'typescript',
        code: 'function myFunction() {}',
        nodeType: 'function_declaration',
        expected: true,
      },
      {
        language: 'typescript',
        code: 'class MyClass { myMethod() {} }',
        nodeType: 'method_definition',
        expected: true,
      },
      // Negative test cases
      {
        language: 'rust',
        code: 'let x = 5;',
        nodeType: 'let_declaration',
        expected: false,
      },
      {
        language: 'typescript',
        code: 'const x = 10;',
        nodeType: 'variable_statement',
        expected: false,
      },
    ]

    testCases.forEach(({ language, code, nodeType, expected }) => {
      it(`should return ${expected} when node type is ${nodeType} in ${language}`, () => {
        const parser = language === 'rust' ? rustParser : tsParser
        const tree = parser.parse(code)
        const rootNode = tree.rootNode

        const nodes = rootNode.descendantsOfType(nodeType)
        const node = nodes && nodes.length ? nodes[0] : undefined
        const result = node
          ? finder.findFunctionNodes(node as unknown as MinimalNode, language)
              .length > 0
          : false

        assert.strictEqual(result, expected)
      })
    })
  })

  describe('Provider negative cases', () => {
    const mockVscode = {
      FoldingRange: class FoldingRange {
        constructor(
          public start: number,
          public end: number,
          public kind: number
        ) {}
      },
      FoldingRangeKind: { Region: 0 },
    }

    it('returns empty for unsupported language', async () => {
      const provider = new FunctionFoldingProvider(
        mockVscode as unknown as typeof vscode
      )

      const doc = {
        languageId: 'unknown',
        getText: () => 'some text',
      } as unknown as vscode.TextDocument

      const ranges = await provider.provideFoldingRanges(doc)
      assert.deepStrictEqual(ranges, [])
    })

    it('returns empty when parser throws during parse', async () => {
      // Monkeypatch ParserManager.getParser to return a parser that throws
      const original = ParserManager.prototype.getParser
      ParserManager.prototype.getParser = function () {
        return {
          parse: () => {
            throw new Error('parse failed')
          },
        } as unknown as ParserType
      }

      try {
        const provider = new FunctionFoldingProvider(
          mockVscode as unknown as typeof vscode
        )
        const doc = {
          languageId: 'typescript',
          getText: () => 'invalid code',
        } as unknown as vscode.TextDocument
        const ranges = await provider.provideFoldingRanges(doc)
        assert.deepStrictEqual(ranges, [])
      } finally {
        ParserManager.prototype.getParser = original
      }
    })
  })
})
