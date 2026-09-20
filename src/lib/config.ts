import fs from 'node:fs'
import path from 'node:path'
import type { OpenCodeConfig } from './types'

const DEFAULT_SCHEMA = 'https://opencode.ai/config.json'

/**
 * Lee `opencode.json`.
 * - Si NO existe → base mínima.
 * - Si existe pero no parsea → LANZA. Nunca recreamos la config del usuario:
 *   es preferible abortar que perder su configuración.
 */
export function loadConfig(file: string): OpenCodeConfig {
  if (!fs.existsSync(file)) return { $schema: DEFAULT_SCHEMA, agent: {} }

  const raw = fs.readFileSync(file, 'utf8')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(
      `No pude parsear ${file} (JSON inválido). Abortado para no corromper tu configuración. ` +
        `Detalle: ${(error as Error).message}`
    )
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${file} no contiene un objeto JSON válido. Abortado.`)
  }

  const config = parsed as OpenCodeConfig
  if (!config.agent) config.agent = {}
  return config
}

/**
 * Escribe la config haciendo **backup** previo si el fichero existía.
 * Solo se reescribe el JSON completo; el merge se hace antes, sobre el objeto
 * leído, preservando el resto de claves.
 */
export function saveConfig(file: string, config: OpenCodeConfig): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    fs.copyFileSync(file, `${file}.bak-${stamp}`)
  }
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n')
}
