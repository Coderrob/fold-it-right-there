#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..')

/**
 * Removes a directory recursively if it exists.
 * @param {string} p - The path to the directory to remove.
 */
function rmDir(p) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true })
      console.log('Removed', p)
    }
  } catch (err) {
    console.error('Failed to remove', p, err)
  }
}

rmDir(path.join(repoRoot, 'out'))
rmDir(path.join(repoRoot, '.vscode-test'))
// keep node_modules; removing it is left to the user
console.log('Clean completed')
