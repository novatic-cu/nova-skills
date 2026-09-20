import fs from 'node:fs'
import path from 'node:path'
import { AGENTS_SOURCE_DIR } from './paths'
import type { AgentFragment, OpenCodeConfig } from './types'

/** Nombres de los agentes del paquete (`.json` en `agents/`). */
export function listAvailableAgents(sourceDir: string = AGENTS_SOURCE_DIR): string[] {
  if (!fs.existsSync(sourceDir)) return []
  return fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
    .sort()
}

/** Lee el fragmento de un agente del paquete. */
export function readAgentFragment(
  name: string,
  sourceDir: string = AGENTS_SOURCE_DIR
): AgentFragment {
  const file = path.join(sourceDir, `${name}.json`)
  if (!fs.existsSync(file)) throw new Error(`Agente "${name}" no encontrado en el paquete.`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as AgentFragment
}

/**
 * Skills que el agente tiene permitidas: claves con valor `"allow"` en
 * `permission.skill`, excluyendo el comodín `"*"`.
 */
export function skillsUsedByAgent(fragment: AgentFragment): string[] {
  const skill = fragment.permission?.skill
  if (!skill || typeof skill !== 'object') return []
  return Object.entries(skill)
    .filter(([key, value]) => key !== '*' && value === 'allow')
    .map(([key]) => key)
}

/** Skills referenciadas por los agentes indicados, leídas de la config real. */
export function skillsUsedByAgents(config: OpenCodeConfig, agentNames: string[]): string[] {
  const used = new Set<string>()
  for (const name of agentNames) {
    const fragment = config.agent?.[name]
    if (fragment) skillsUsedByAgent(fragment).forEach((skill) => used.add(skill))
  }
  return [...used]
}

/** Añade/actualiza un agente en la config (inmutable). */
export function mergeAgent(
  config: OpenCodeConfig,
  name: string,
  fragment: AgentFragment
): OpenCodeConfig {
  return { ...config, agent: { ...(config.agent ?? {}), [name]: fragment } }
}

/** Elimina un agente de la config (inmutable). */
export function removeAgent(config: OpenCodeConfig, name: string): OpenCodeConfig {
  const agent = { ...(config.agent ?? {}) }
  delete agent[name]
  return { ...config, agent }
}
