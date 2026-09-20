import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  AGENTS_SOURCE_DIR,
  PACKAGE_ROOT,
  SKILLS_SOURCE_DIR,
  globalConfigDir,
  resolveScopePaths,
} from '../src/lib/paths'

describe('PACKAGE_ROOT', () => {
  it('apunta a la raíz del paquete (contiene package.json)', () => {
    expect(fs.existsSync(path.join(PACKAGE_ROOT, 'package.json'))).toBe(true)
    expect(SKILLS_SOURCE_DIR).toBe(path.join(PACKAGE_ROOT, 'skills'))
    expect(AGENTS_SOURCE_DIR).toBe(path.join(PACKAGE_ROOT, 'agents'))
  })
})

describe('resolveScopePaths', () => {
  it('global usa el directorio de config global', () => {
    const paths = resolveScopePaths('global')
    expect(paths.baseDir).toBe(globalConfigDir())
    expect(paths.skillsDir).toBe(path.join(globalConfigDir(), 'skills'))
    expect(paths.configFile).toBe(path.join(globalConfigDir(), 'opencode.json'))
    expect(paths.manifestFile).toBe(path.join(globalConfigDir(), '.nova-skills.json'))
  })

  it('local usa <cwd>/.opencode y <cwd>/opencode.json', () => {
    const paths = resolveScopePaths('local', '/tmp/proyecto')
    expect(paths.baseDir).toBe(path.join('/tmp/proyecto', '.opencode'))
    expect(paths.skillsDir).toBe(path.join('/tmp/proyecto', '.opencode', 'skills'))
    expect(paths.configFile).toBe(path.join('/tmp/proyecto', 'opencode.json'))
    expect(paths.manifestFile).toBe(path.join('/tmp/proyecto', '.opencode', '.nova-skills.json'))
  })
})
