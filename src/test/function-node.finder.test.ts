import assert from 'assert'

import { FunctionNodeFinder, MinimalNode } from '../function-node.finder.js'

describe('FunctionNodeFinder', () => {
  const finder = new FunctionNodeFinder()

  it('finds function nodes in a simple tree (positive)', () => {
    const tree: MinimalNode = {
      type: 'source_file',
      children: [
        {
          type: 'function_declaration',
          startPosition: { row: 0 },
          endPosition: { row: 2 },
        },
        {
          type: 'variable_statement',
          startPosition: { row: 3 },
          endPosition: { row: 3 },
        },
      ],
    }

    const nodes = finder.findFunctionNodes(tree, 'typescript')
    assert.strictEqual(nodes.length, 1)
    assert.strictEqual(nodes[0].type, 'function_declaration')
  })

  it('returns empty array for unsupported language (negative)', () => {
    const tree: MinimalNode = { type: 'source_file', children: [] }
    const nodes = finder.findFunctionNodes(tree, 'unknown')
    assert.deepStrictEqual(nodes, [])
  })

  it('should find nested function nodes (positive nested)', () => {
    const tree: MinimalNode = {
      type: 'source_file',
      children: [
        {
          type: 'class_declaration',
          children: [
            {
              type: 'method_definition',
              startPosition: { row: 0 },
              endPosition: { row: 1 },
            },
            {
              type: 'property',
              startPosition: { row: 2 },
              endPosition: { row: 2 },
            },
          ],
        },
      ],
    }

    const nodes = finder.findFunctionNodes(tree, 'typescript')
    assert.strictEqual(nodes.length, 1)
    assert.strictEqual(nodes[0].type, 'method_definition')
  })

  it('should support predicate-based matching (extensible)', () => {
    const predicateFinder = new FunctionNodeFinder(undefined, {
      typescript: (n: MinimalNode) =>
        n.type.startsWith('arrow_function') ||
        n.type === 'function_declaration',
    })

    const tree: MinimalNode = {
      type: 'source_file',
      children: [
        {
          type: 'arrow_function_expression',
          startPosition: { row: 0 },
          endPosition: { row: 1 },
        },
        {
          type: 'variable_statement',
          startPosition: { row: 2 },
          endPosition: { row: 2 },
        },
      ],
    }

    const nodes = predicateFinder.findFunctionNodes(tree, 'typescript')
    assert.strictEqual(nodes.length, 1)
    assert.ok(nodes[0].type.startsWith('arrow_function'))
  })
})
