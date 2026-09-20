import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { loadConfig, saveConfig } from '../src/lib/config'

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-config-'))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('loadConfig', () => {
  it('fichero inexistente → base mínima', () => {
    const config = loadConfig(path.join(dir, 'opencode.json'))
    expect(config.$schema).toBe('https://opencode.ai/config.json')
    expect(config.agent).toEqual({})
  })

  it('preserva las claves del usuario', () => {
    const file = path.join(dir, 'opencode.json')
    fs.writeFileSync(
      file,
      JSON.stringify({ theme: 'system', mcp: { x: {} }, agent: { build: { mode: 'primary' } } })
    )
    const config = loadConfig(file)
    expect(config.theme).toBe('system')
    expect(config.mcp).toEqual({ x: {} })
    expect(config.agent?.build).toEqual({ mode: 'primary' })
  })

  it('añade agent vacío si falta', () => {
    const file = path.join(dir, 'opencode.json')
    fs.writeFileSync(file, JSON.stringify({ theme: 'dark' }))
    expect(loadConfig(file).agent).toEqual({})
  })

  it('JSON inválido → LANZA (nunca recrea la config)', () => {
    const file = path.join(dir, 'opencode.json')
    fs.writeFileSync(file, '{ roto')
    expect(() => loadConfig(file)).toThrow(/JSON inválido/)
  })

  it('JSON que no es objeto → LANZA', () => {
    const file = path.join(dir, 'opencode.json')
    fs.writeFileSync(file, '[1,2,3]')
    expect(() => loadConfig(file)).toThrow()
  })
})

describe('saveConfig', () => {
  it('hace backup si el fichero existía', () => {
    const file = path.join(dir, 'opencode.json')
    fs.writeFileSync(file, '{}')
    saveConfig(file, { $schema: 'x', agent: {} })
    const backups = fs.readdirSync(dir).filter((f) => f.startsWith('opencode.json.bak-'))
    expect(backups).toHaveLength(1)
  })

  it('no hace backup si es nuevo y escribe JSON válido', () => {
    const file = path.join(dir, 'sub', 'opencode.json')
    saveConfig(file, { $schema: 'x', agent: { plan: { mode: 'primary' } } })
    expect(fs.readdirSync(path.dirname(file))).toEqual(['opencode.json'])
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).agent.plan.mode).toBe('primary')
  })
})
