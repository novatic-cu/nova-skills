import { describe, it, expect } from 'vitest'
import {
  listAvailableAgents,
  mergeAgent,
  readAgentFragment,
  removeAgent,
  skillsUsedByAgent,
  skillsUsedByAgents,
} from '../src/lib/agents'
import type { OpenCodeConfig } from '../src/lib/types'

const agents = listAvailableAgents()

describe('agentes del paquete', () => {
  it('son 7', () => {
    expect(agents).toEqual(['backend', 'build', 'dba', 'devops', 'frontend', 'marketing', 'plan'])
  })

  it('solo plan y build son primary (seleccionables con Tab)', () => {
    const primary = agents.filter((name) => readAgentFragment(name).mode === 'primary')
    expect(primary.sort()).toEqual(['build', 'plan'])
    const rest = agents.filter((name) => readAgentFragment(name).mode === 'subagent')
    expect(rest.sort()).toEqual(['backend', 'dba', 'devops', 'frontend', 'marketing'])
  })

  it('todos usan el schema real (description + prompt + permission.skill)', () => {
    for (const name of agents) {
      const fragment = readAgentFragment(name)
      expect(typeof fragment.description, `${name}.description`).toBe('string')
      expect((fragment.description ?? '').length, `${name}.description`).toBeGreaterThan(0)
      expect(typeof fragment.prompt, `${name}.prompt`).toBe('string')
      expect(fragment.permission?.skill?.['*'], `${name}.permission.skill["*"]`).toBe('deny')
      // Claves inválidas del diseño viejo
      expect(fragment).not.toHaveProperty('instructions')
      expect(fragment).not.toHaveProperty('skills')
    }
  })

  it('readAgentFragment lanza si no existe', () => {
    expect(() => readAgentFragment('no-existe')).toThrow()
  })
})

describe('skillsUsedByAgent', () => {
  it('ignora el comodín y solo cuenta "allow"', () => {
    expect(
      skillsUsedByAgent({
        permission: { skill: { '*': 'deny', 'a-skill': 'allow', 'b-skill': 'ask' } },
      })
    ).toEqual(['a-skill'])
  })

  it('sin permiso de skills → lista vacía', () => {
    expect(skillsUsedByAgent({})).toEqual([])
  })
})

describe('mergeAgent / removeAgent', () => {
  const base: OpenCodeConfig = { $schema: 'x', agent: { build: { mode: 'primary' } } }

  it('merge no muta el original y preserva el resto de claves', () => {
    const merged = mergeAgent(base, 'plan', { mode: 'primary' })
    expect(base.agent).not.toHaveProperty('plan')
    expect(merged.$schema).toBe('x')
    expect(Object.keys(merged.agent ?? {}).sort()).toEqual(['build', 'plan'])
  })

  it('remove elimina solo el agente indicado', () => {
    const merged = mergeAgent(base, 'plan', { mode: 'primary' })
    const removed = removeAgent(merged, 'build')
    expect(Object.keys(removed.agent ?? {})).toEqual(['plan'])
  })
})

describe('skillsUsedByAgents', () => {
  it('une las skills de varios agentes', () => {
    const config: OpenCodeConfig = {
      agent: {
        plan: { permission: { skill: { '*': 'deny', 'clean-architecture': 'allow' } } },
        dba: { permission: { skill: { '*': 'deny', 'data-integrity': 'allow' } } },
      },
    }
    expect(skillsUsedByAgents(config, ['plan', 'dba']).sort()).toEqual([
      'clean-architecture',
      'data-integrity',
    ])
  })
})
