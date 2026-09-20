import fs from 'node:fs'
import path from 'node:path'
import type { Manifest } from './types'

/** Manifiesto vacío (con marca de tiempo). */
export function emptyManifest(): Manifest {
  return { version: 1, installedAt: new Date().toISOString(), skills: [], agents: [] }
}

/** Lee el manifiesto; si no existe o está corrupto, devuelve uno vacío. */
export function readManifest(file: string): Manifest {
  if (!fs.existsSync(file)) return emptyManifest()
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<Manifest>
    return {
      version: 1,
      installedAt:
        typeof parsed.installedAt === 'string' ? parsed.installedAt : new Date().toISOString(),
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.filter((s): s is string => typeof s === 'string')
        : [],
      agents: Array.isArray(parsed.agents)
        ? parsed.agents.filter((s): s is string => typeof s === 'string')
        : [],
    }
  } catch {
    return emptyManifest()
  }
}

/** Escribe el manifiesto (crea el directorio si hace falta). */
export function writeManifest(file: string, manifest: Manifest): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n')
}

/** Añade elementos únicos y devuelve la lista ordenada. */
export function addUnique(list: string[], items: string[]): string[] {
  return [...new Set([...list, ...items])].sort()
}

/** Quita elementos y devuelve la lista ordenada. */
export function removeItems(list: string[], items: string[]): string[] {
  const drop = new Set(items)
  return list.filter((item) => !drop.has(item))
}
