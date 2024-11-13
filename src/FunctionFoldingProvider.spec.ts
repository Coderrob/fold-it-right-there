import Parser from 'tree-sitter'
import Rust from 'tree-sitter-rust'
import TypeScript from 'tree-sitter-typescript'
import { FunctionFoldingProvider } from './FunctionFoldingProvider'
import assert from 'assert'

describe('FunctionFoldingProvider', () => {
  const foldingProvider = new FunctionFoldingProvider()

  describe('isFunctionNode', () => {
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
      it('should return $expected when node type is $nodeType in $language', () => {
        const parser = language === 'rust' ? rustParser : tsParser
        const tree = parser.parse(code)
        const rootNode = tree.rootNode

        const node = rootNode.descendantsOfType(nodeType)[0]
        const result = foldingProvider['isFunctionNode'](node)

        assert.strictEqual(result, expected)
      })
    })
  })
})
