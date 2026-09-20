import os from 'node:os'
import path from 'node:path'
import type { Scope, ScopePaths } from './types'

/**
 * Raíz del paquete. Funciona igual en dev (`src/lib` → `../..`) que en el
 * build (`dist/lib` → `../..`), así que `skills/` y `agents/` se resuelven
 * siempre contra la raíz del paquete publicado.
 */
export const PACKAGE_ROOT = path.resolve(__dirname, '..', '..')
export const SKILLS_SOURCE_DIR = path.join(PACKAGE_ROOT, 'skills')
export const AGENTS_SOURCE_DIR = path.join(PACKAGE_ROOT, 'agents')

/** Directorio global de configuración de OpenCode según SO. */
export function globalConfigDir(): string {
  return process.platform === 'win32'
    ? path.join(process.env.APPDATA ?? '', 'opencode')
    : path.join(os.homedir(), '.config', 'opencode')
}

/** Resuelve todas las rutas de un ámbito. */
export function resolveScopePaths(scope: Scope, cwd: string = process.cwd()): ScopePaths {
  if (scope === 'global') {
    const baseDir = globalConfigDir()
    return {
      scope,
      baseDir,
      skillsDir: path.join(baseDir, 'skills'),
      configFile: path.join(baseDir, 'opencode.json'),
      manifestFile: path.join(baseDir, '.nova-skills.json'),
    }
  }

  const baseDir = path.join(cwd, '.opencode')
  return {
    scope,
    baseDir,
    skillsDir: path.join(baseDir, 'skills'),
    configFile: path.join(cwd, 'opencode.json'),
    manifestFile: path.join(baseDir, '.nova-skills.json'),
  }
}
