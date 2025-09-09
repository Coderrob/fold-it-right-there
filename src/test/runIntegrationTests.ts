import path from 'path'
import { fileURLToPath } from 'url'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const extensionDevelopmentPath = path.resolve(__dirname, '../../')
    const extensionTestsPath = path.resolve(__dirname, './index.js')

    // Recommended launch args: clean user-data-dir and disable other extensions.
    const defaultLaunchArgs = [
      '--disable-extensions',
      `--user-data-dir=${path.resolve(__dirname, '../../.vscode-test')}`,
    ]

    // Allow callers to append extra args via ENV: INTEGRATION_LAUNCH_ARGS
    const extra = process.env.INTEGRATION_LAUNCH_ARGS
      ? process.env.INTEGRATION_LAUNCH_ARGS.split(' ')
      : []

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      version: 'stable',
      launchArgs: [...defaultLaunchArgs, ...extra],
    })
  } catch (err) {
    console.error('Failed to run integration tests', err)
    process.exit(1)
  }
}

void main()
