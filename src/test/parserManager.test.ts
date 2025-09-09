import assert from 'assert'
import { ParserManager } from '../parserManager.js'

describe('ParserManager', () => {
  const pm = new ParserManager()

  it('returns a parser for typescript', () => {
    const p = pm.getParser('typescript')
    assert.ok(p, 'Expected a parser for typescript')
    const tree = p!.parse('function a() {}')
    assert.ok(tree.rootNode, 'Expected a parsed tree')
  })

  it('returns a parser for rust', () => {
    const p = pm.getParser('rust')
    assert.ok(p, 'Expected a parser for rust')
    const tree = p!.parse('fn main() {}')
    assert.ok(tree.rootNode, 'Expected a parsed tree')
  })

  it('returns a parser for javascript', () => {
    const p = pm.getParser('javascript')
    assert.ok(p, 'Expected a parser for javascript')
    const tree = p!.parse('function b() {}')
    assert.ok(tree.rootNode, 'Expected a parsed tree')
  })

  it('returns undefined for unknown language', () => {
    const p = pm.getParser('unknown')
    assert.strictEqual(p, undefined)
  })
})
