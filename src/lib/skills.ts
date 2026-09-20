import fs from 'node:fs'
import path from 'node:path'
import { SKILLS_SOURCE_DIR } from './paths'

/** Nombres de las skills del paquete (solo carpetas con `SKILL.md`). */
export function listAvailableSkills(sourceDir: string = SKILLS_SOURCE_DIR): string[] {
  if (!fs.existsSync(sourceDir)) return []
  return fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(sourceDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort()
}

/** ¿Existe la skill en el paquete? */
export function skillExists(name: string, sourceDir: string = SKILLS_SOURCE_DIR): boolean {
  return fs.existsSync(path.join(sourceDir, name, 'SKILL.md'))
}

/**
 * Copia la skill COMPLETA al destino: `SKILL.md` y cualquier subcarpeta
 * (`scripts/`, `references/`, …). Sin prefijo: la carpeta conserva el nombre
 * del frontmatter, que es lo que OpenCode exige.
 */
export function copySkill(
  name: string,
  destSkillsDir: string,
  sourceDir: string = SKILLS_SOURCE_DIR
): void {
  const source = path.join(sourceDir, name)
  const dest = path.join(destSkillsDir, name)
  fs.mkdirSync(destSkillsDir, { recursive: true })
  fs.cpSync(source, dest, { recursive: true })
}

/** Borra la skill del destino. Devuelve `true` si existía. */
export function removeSkill(name: string, destSkillsDir: string): boolean {
  const dest = path.join(destSkillsDir, name)
  if (!fs.existsSync(dest)) return false
  fs.rmSync(dest, { recursive: true, force: true })
  return true
}

/**
 * Lee el `name` del frontmatter YAML. Se usa para validar la regla de OpenCode
 * (el nombre debe coincidir con el de la carpeta).
 */
export function readFrontmatterName(skillFile: string): string | null {
  const raw = fs.readFileSync(skillFile, 'utf8')
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return null
  const line = block[1].split(/\r?\n/).find((candidate) => /^name\s*:/.test(candidate))
  if (!line) return null
  return line
    .replace(/^name\s*:\s*/, '')
    .trim()
    .replace(/^["']|["']$/g, '')
}
