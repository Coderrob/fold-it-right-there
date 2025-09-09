# fold-it-right-there — code-folding experiment

This repository is an experimental Visual Studio Code extension that explores multi-language code folding driven by Tree-sitter parsing.

Purpose

- Investigate using Tree-sitter grammars to provide precise folding ranges for function-like constructs across languages.
- Provide a maintainable foundation to add new languages and folding heuristics.

Quick start

Prerequisites:

- Node.js 18+
- Yarn

Install

```bash
yarn
```

Build

```bash
yarn run compile
```

Run unit tests

```bash
yarn test
```

Run integration tests (launches a VS Code test host)

```bash
yarn run test:integration
```

Run the extension locally

1. Open this folder in VS Code.
2. Press F5 to start the Extension Development Host.
3. Open a TypeScript/Rust/JavaScript file and inspect folding behaviour.

Where to look

- `src/ParserManager.ts` — creates and manages Tree-sitter parsers (now lazy-initialized).
- `src/FunctionFoldingProvider.ts` — logic that converts parse nodes to folding ranges.
- `src/extension.ts` — activation code; provider is lazy-loaded on first use.
- `src/test/` — unit and integration test scaffolding.

Adding a language (overview)

1. Add a tree-sitter grammar package as a dependency.
2. In `ParserManager.createParserFor()` add a branch that sets the grammar for the new language.
3. In `FunctionFoldingProvider.functionNodeTypes` include the node types that represent foldable constructs, or provide a predicate in `FunctionNodeFinder` for advanced heuristics.
4. Add unit tests for the detection logic.

Notes and limitations

- Tree-sitter grammars can include native code and may need a C/C++ build toolchain during install.
- Tests are run against compiled output to avoid ts-node/ESM loader issues.
- The folding strategy is intentionally minimal by design — add heuristics as needed.

Contributing

- Follow the iterative process in `TODO.md`. Update `CHANGELOG.md` with a dated entry when a task is completed and validated.

Troubleshooting

- If the extension host is unresponsive when you run the extension, the most common cause is heavy native initialization at activation. This project aims to avoid that by lazily creating parsers and lazy-loading the provider.
- To debug: compile and then press F5 in VS Code; capture the extension host logs and share them here if you want help diagnosing.

Developer notes — predicates and integration tests

- Predicate matchers: `FunctionNodeFinder` accepts an optional `predicates` map. Use this when node type alone is insufficient. Example:

```ts
const finder = new FunctionNodeFinder(undefined, {
 typescript: (n) => n.type.startsWith('arrow_function') || n.type === 'function_declaration'
})
```

- Integration runner: tests run the VS Code test host with `--disable-extensions` to avoid third-party interference. If you need to enable extensions, update `src/test/runIntegrationTests.ts`.
