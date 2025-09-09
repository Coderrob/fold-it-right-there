import path from 'path'
import { fileURLToPath } from 'url'
import Mocha from 'mocha'
import glob from 'glob'

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'bdd', color: true })

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const testsRoot = path.resolve(__dirname, '..')
  return new Promise((resolve, reject) => {
    glob(
      '**/*.test.js',
      { cwd: testsRoot },
      (err: Error | null, files: string[]) => {
        if (err) return reject(err)

        // Add files to mocha
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)))

        try {
          mocha.run((failures: number) => {
            if (failures > 0) reject(new Error(`${failures} tests failed.`))
            else resolve()
          })
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}
