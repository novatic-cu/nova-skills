#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { PACKAGE_ROOT, resolveScopePaths } from './lib/paths'
import {
  addUnique,
  emptyManifest,
  readManifest,
  removeItems,
  writeManifest,
} from './lib/manifest'
import { copySkill, listAvailableSkills, removeSkill, skillExists } from './lib/skills'
import {
  listAvailableAgents,
  mergeAgent,
  readAgentFragment,
  removeAgent,
  skillsUsedByAgent,
  skillsUsedByAgents,
} from './lib/agents'
import { loadConfig, saveConfig } from './lib/config'
import type { Manifest, Scope, ScopePaths } from './lib/types'

const pkg = JSON.parse(
  fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')
) as { name: string; version: string }

interface CliOptions {
  scope?: Scope
  yes: boolean
  force: boolean
}

// ── Entrada interactiva (solo se crea si hace falta) ────────────────────────
let rl: readline.Interface | null = null
function question(query: string): Promise<string> {
  if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl!.question(query, resolve))
}
function closeRl(): void {
  if (rl) {
    rl.close()
    rl = null
  }
}

// ── Argumentos ──────────────────────────────────────────────────────────────
function parseArgs(argv: string[]): { flags: Set<string>; positional: string[] } {
  const flags = new Set<string>()
  const positional: string[] = []
  for (const arg of argv) {
    if (arg.startsWith('-')) flags.add(arg)
    else positional.push(arg)
  }
  return { flags, positional }
}

function printHelp(): void {
  console.log(`
${pkg.name} v${pkg.version} — Skills y agentes para OpenCode

Uso:
  npx ${pkg.name} [comando] [flags]

Comandos:
  (sin comando)              Instala TODAS las skills y agentes
  skill <nombre>             Instala una skill
  agent <nombre>             Instala un agente (y las skills que permite)
  uninstall                  Desinstala todo lo instalado por este paquete
  uninstall agent <nombre>   Desinstala un agente (y sus skills huérfanas)
  uninstall skill <nombre>   Desinstala una skill (si ningún agente la usa)

Flags:
  --global                   Ámbito global (~/.config/opencode)
  --local                    Ámbito local (./.opencode + ./opencode.json)
  --yes, -y                  Sin preguntas (ámbito global por defecto)
  --force                    Sobrescribe skills/agentes que no instaló este paquete
  --help, -h                 Esta ayuda
  --version, -v              Versión

Ejemplos:
  npx ${pkg.name}                      # todo, pregunta ámbito
  npx ${pkg.name} agent backend --global
  npx ${pkg.name} uninstall --global
`)
}

// ── Ámbito ──────────────────────────────────────────────────────────────────
async function askScope(opts: CliOptions): Promise<Scope> {
  if (opts.scope) return opts.scope
  if (opts.yes) return 'global'
  const answer = (await question('¿Dónde quieres operar? (global / local): ')).trim().toLowerCase()
  return answer === 'local' ? 'local' : 'global'
}

// ── Instalación ─────────────────────────────────────────────────────────────
function skillsDirFor(paths: ScopePaths): string {
  return paths.skillsDir
}

function installSkillInto(
  name: string,
  paths: ScopePaths,
  manifest: Manifest,
  opts: CliOptions
): 'installed' | 'skipped' {
  const dest = path.join(skillsDirFor(paths), name)
  const ours = manifest.skills.includes(name)
  if (fs.existsSync(dest) && !ours && !opts.force) return 'skipped'
  copySkill(name, skillsDirFor(paths))
  manifest.skills = addUnique(manifest.skills, [name])
  return 'installed'
}

async function installAll(paths: ScopePaths, opts: CliOptions): Promise<void> {
  const manifest = readManifest(paths.manifestFile)
  let config = loadConfig(paths.configFile)

  const installedSkills: string[] = []
  const skippedSkills: string[] = []
  for (const name of listAvailableSkills()) {
    if (installSkillInto(name, paths, manifest, opts) === 'installed') installedSkills.push(name)
    else skippedSkills.push(name)
  }

  const installedAgents: string[] = []
  const skippedAgents: string[] = []
  for (const name of listAvailableAgents()) {
    const exists = Boolean(config.agent?.[name])
    const ours = manifest.agents.includes(name)
    if (exists && !ours && !opts.force) {
      skippedAgents.push(name)
      continue
    }
    config = mergeAgent(config, name, readAgentFragment(name))
    manifest.agents = addUnique(manifest.agents, [name])
    installedAgents.push(name)
  }

  saveConfig(paths.configFile, config)
  manifest.installedAt = new Date().toISOString()
  writeManifest(paths.manifestFile, manifest)

  console.log(`\n✅ ${installedSkills.length} skills instaladas en ${paths.scope} (${paths.skillsDir}).`)
  if (skippedSkills.length) {
    console.log(`ℹ️  ${skippedSkills.length} skills omitidas (ya existían y no las instaló este paquete): ${skippedSkills.join(', ')}`)
  }
  console.log(`✅ ${installedAgents.length} agentes configurados en ${paths.configFile}.`)
  if (skippedAgents.length) {
    console.log(`ℹ️  ${skippedAgents.length} agentes omitidos (ya existían): ${skippedAgents.join(', ')}`)
  }
  console.log('\n🔥 Listo. Reinicia OpenCode si estaba abierto.\n')
}

async function installOneSkill(paths: ScopePaths, name: string, opts: CliOptions): Promise<void> {
  if (!skillExists(name)) {
    console.log(`❌ Skill "${name}" no encontrada en el paquete.`)
    return
  }
  const manifest = readManifest(paths.manifestFile)
  const result = installSkillInto(name, paths, manifest, opts)
  if (result === 'skipped') {
    console.log(`ℹ️  La skill "${name}" ya existe y no fue instalada por este paquete. Usa --force para sobrescribir.`)
    return
  }
  writeManifest(paths.manifestFile, manifest)
  console.log(`✅ Skill "${name}" instalada en ${paths.scope}: ${path.join(paths.skillsDir, name)}`)
}

async function installOneAgent(paths: ScopePaths, name: string, opts: CliOptions): Promise<void> {
  let fragment
  try {
    fragment = readAgentFragment(name)
  } catch {
    console.log(`❌ Agente "${name}" no encontrado en el paquete.`)
    return
  }

  const config = loadConfig(paths.configFile)
  const manifest = readManifest(paths.manifestFile)

  if (config.agent?.[name] && !manifest.agents.includes(name) && !opts.force) {
    console.log(`ℹ️  El agente "${name}" ya existe y no fue instalado por este paquete. Usa --force para sobrescribir.`)
    return
  }

  saveConfig(paths.configFile, mergeAgent(config, name, fragment))
  manifest.agents = addUnique(manifest.agents, [name])

  const installedSkills: string[] = []
  for (const skill of skillsUsedByAgent(fragment)) {
    if (!skillExists(skill)) continue
    if (installSkillInto(skill, paths, manifest, opts) === 'installed') installedSkills.push(skill)
  }

  manifest.installedAt = new Date().toISOString()
  writeManifest(paths.manifestFile, manifest)

  console.log(`✅ Agente "${name}" configurado en ${paths.scope}.`)
  if (installedSkills.length) {
    console.log(`✅ Skills del agente instaladas: ${installedSkills.join(', ')}`)
  }
}

// ── Desinstalación ──────────────────────────────────────────────────────────
function skillsUsedByAnyAgent(config: ReturnType<typeof loadConfig>): Set<string> {
  return new Set(skillsUsedByAgents(config, Object.keys(config.agent ?? {})))
}

async function uninstallAll(paths: ScopePaths): Promise<void> {
  const manifest = readManifest(paths.manifestFile)
  let config = loadConfig(paths.configFile)

  let removedSkills = 0
  for (const skill of manifest.skills) {
    if (removeSkill(skill, paths.skillsDir)) removedSkills += 1
  }

  for (const agent of manifest.agents) config = removeAgent(config, agent)
  saveConfig(paths.configFile, config)
  writeManifest(paths.manifestFile, emptyManifest())

  console.log(`\n🧹 ${removedSkills} skills eliminadas de ${paths.skillsDir}.`)
  console.log(`🧹 ${manifest.agents.length} agentes eliminados de ${paths.configFile}.\n`)
}

async function uninstallOneAgent(paths: ScopePaths, name: string): Promise<void> {
  const manifest = readManifest(paths.manifestFile)
  let config = loadConfig(paths.configFile)

  if (!config.agent?.[name]) {
    console.log(`❌ El agente "${name}" no existe en ${paths.configFile}.`)
    return
  }

  config = removeAgent(config, name)
  saveConfig(paths.configFile, config)

  // Huérfanas: skills del manifiesto que ya no usa NINGÚN agente de la config.
  const stillUsed = skillsUsedByAnyAgent(config)
  const orphans = manifest.skills.filter((skill) => !stillUsed.has(skill))
  let removed = 0
  for (const skill of orphans) {
    if (removeSkill(skill, paths.skillsDir)) removed += 1
  }
  manifest.skills = removeItems(manifest.skills, orphans)
  manifest.agents = removeItems(manifest.agents, [name])
  writeManifest(paths.manifestFile, manifest)

  console.log(`✅ Agente "${name}" eliminado.`)
  if (removed) console.log(`✅ ${removed} skills huérfanas eliminadas.`)
}

async function uninstallOneSkill(paths: ScopePaths, name: string): Promise<void> {
  const config = loadConfig(paths.configFile)
  if (skillsUsedByAnyAgent(config).has(name)) {
    console.log(`❌ La skill "${name}" está en uso por uno o más agentes. Elimina primero esos agentes.`)
    return
  }

  const manifest = readManifest(paths.manifestFile)
  if (removeSkill(name, paths.skillsDir)) {
    manifest.skills = removeItems(manifest.skills, [name])
    writeManifest(paths.manifestFile, manifest)
    console.log(`✅ Skill "${name}" eliminada.`)
  } else {
    console.log(`❌ La skill "${name}" no existe en ${paths.skillsDir}.`)
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const { flags, positional } = parseArgs(process.argv.slice(2))

  if (flags.has('--help') || flags.has('-h')) return printHelp()
  if (flags.has('--version') || flags.has('-v')) {
    console.log(pkg.version)
    return
  }

  const opts: CliOptions = {
    scope: flags.has('--global') ? 'global' : flags.has('--local') ? 'local' : undefined,
    yes: flags.has('--yes') || flags.has('-y'),
    force: flags.has('--force'),
  }

  const [command, subCommand, target] = positional
  console.log(`\n🚀 ${pkg.name} — dopando tu OpenCode...\n`)

  const scope = await askScope(opts)
  const paths = resolveScopePaths(scope)
  closeRl()

  if (!command) {
    await installAll(paths, opts)
  } else if (command === 'skill') {
    if (!subCommand) console.log('❌ Falta el nombre. Ejemplo: npx @novatic/skills skill nest-mastery')
    else await installOneSkill(paths, subCommand, opts)
  } else if (command === 'agent') {
    if (!subCommand) console.log('❌ Falta el nombre. Ejemplo: npx @novatic/skills agent backend')
    else await installOneAgent(paths, subCommand, opts)
  } else if (command === 'uninstall') {
    if (!subCommand || subCommand === 'all') await uninstallAll(paths)
    else if (subCommand === 'agent') {
      if (!target) console.log('❌ Falta el agente. Ejemplo: npx @novatic/skills uninstall agent backend')
      else await uninstallOneAgent(paths, target)
    } else if (subCommand === 'skill') {
      if (!target) console.log('❌ Falta la skill. Ejemplo: npx @novatic/skills uninstall skill nest-mastery')
      else await uninstallOneSkill(paths, target)
    } else {
      console.log('❌ Subcomando no reconocido. Usa: uninstall [all | agent <nombre> | skill <nombre>]')
    }
  } else {
    console.log(`❌ Comando no reconocido: "${command}". Usa --help.`)
  }
}

main().catch((error: unknown) => {
  console.error(`\n❌ ${(error as Error).message}\n`)
  process.exitCode = 1
})
