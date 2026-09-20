import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  copySkill,
  listAvailableSkills,
  readFrontmatterName,
  removeSkill,
  skillExists,
} from '../src/lib/skills'
import { listAvailableAgents, readAgentFragment, skillsUsedByAgent } from '../src/lib/agents'
import { SKILLS_SOURCE_DIR } from '../src/lib/paths'

const skills = listAvailableSkills()

describe('inventario de skills', () => {
  it('el paquete trae 56 skills', () => {
    expect(skills).toHaveLength(56)
  })

  it.each(skills)('%s: name del frontmatter == carpeta (regla de OpenCode)', (name) => {
    const file = path.join(SKILLS_SOURCE_DIR, name, 'SKILL.md')
    expect(readFrontmatterName(file)).toBe(name)
  })

  it('todas las skills referenciadas por agentes existen en el paquete', () => {
    for (const agent of listAvailableAgents()) {
      for (const skill of skillsUsedByAgent(readAgentFragment(agent))) {
        expect(skills, `agente "${agent}" referencia la skill "${skill}"`).toContain(skill)
      }
    }
  })
})

describe('copySkill / removeSkill', () => {
  let dir: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-skills-'))
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('copia la skill completa sin prefijo', () => {
    const name = skills[0]
    copySkill(name, dir)
    expect(fs.existsSync(path.join(dir, name, 'SKILL.md'))).toBe(true)
    expect(removeSkill(name, dir)).toBe(true)
    expect(fs.existsSync(path.join(dir, name))).toBe(false)
  })

  it('removeSkill devuelve false si no existe', () => {
    expect(removeSkill('no-existe', dir)).toBe(false)
  })
})

describe('skillExists / readFrontmatterName', () => {
  it('detecta skills inexistentes', () => {
    expect(skillExists('clean-architecture')).toBe(true)
    expect(skillExists('no-existe')).toBe(false)
  })

  it('lee el name aunque esté entre comillas', () => {
    const file = path.join(os.tmpdir(), `nova-fm-${Date.now()}.md`)
    fs.writeFileSync(file, '---\nname: "mi-skill"\ndescription: x\n---\n\n# Hola\n')
    expect(readFrontmatterName(file)).toBe('mi-skill')
    fs.rmSync(file, { force: true })
  })

  it('devuelve null sin frontmatter o sin name', () => {
    const file = path.join(os.tmpdir(), `nova-fm2-${Date.now()}.md`)
    fs.writeFileSync(file, '# Sin frontmatter\n')
    expect(readFrontmatterName(file)).toBeNull()
    fs.writeFileSync(file, '---\ndescription: x\n---\n')
    expect(readFrontmatterName(file)).toBeNull()
    fs.rmSync(file, { force: true })
  })
})
