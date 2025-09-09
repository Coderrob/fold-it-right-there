import Parser from 'tree-sitter'
import Rust from 'tree-sitter-rust'
import TypeScript from 'tree-sitter-typescript'

/**
 * Supported language keys for parsing.
 */
export type LanguageKey = 'rust' | 'typescript' | 'javascript'

/**
 * Manages tree-sitter parsers for different languages.
 * Parsers are created lazily to avoid heavy initialization.
 */
export class ParserManager {
  private parsers: Map<LanguageKey, Parser>

  /**
   * Creates a new ParserManager instance.
   */
  constructor() {
    this.parsers = new Map()
    // Do not initialize heavy parsers eagerly; create them lazily
  }

  /**
   * Creates a parser for the specified language.
   * @param language The language key.
   * @returns A configured tree-sitter Parser instance.
   * @private
   */
  private createParserFor(language: LanguageKey): Parser {
    const parser = new Parser()

    switch (language) {
      case 'rust':
        parser.setLanguage(Rust)
        break
      case 'typescript':
      case 'javascript':
        // reuse the typescript grammar for javascript
        parser.setLanguage(TypeScript.typescript)
        break
      default:
        throw new Error(`Unsupported language: ${language}`)
    }

    return parser
  }

  /**
   * Gets a parser for the specified language ID.
   * Creates the parser lazily if it doesn't exist.
   * @param languageId The language ID (e.g., 'typescript').
   * @returns A tree-sitter Parser instance or undefined if unsupported.
   */
  getParser(languageId: string): Parser | undefined {
    const key = languageId as LanguageKey
    if (!['rust', 'typescript', 'javascript'].includes(key)) return undefined

    if (!this.parsers.has(key)) {
      try {
        const p = this.createParserFor(key)
        this.parsers.set(key, p)
      } catch {
        return undefined
      }
    }

    return this.parsers.get(key)
  }
}
