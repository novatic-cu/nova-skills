/**
 * Tipos compartidos del instalador.
 */

/** Ámbito de instalación. */
export type Scope = 'global' | 'local'

/** Rutas resueltas para un ámbito. */
export interface ScopePaths {
  scope: Scope
  /** Directorio base de configuración (global: `~/.config/opencode` · local: `<cwd>/.opencode`). */
  baseDir: string
  /** Directorio destino de las skills. */
  skillsDir: string
  /** Fichero `opencode.json` del ámbito. */
  configFile: string
  /** Manifiesto de lo instalado por este paquete. */
  manifestFile: string
}

/** Permisos de un agente (solo lo que usamos). */
export interface AgentPermission {
  skill?: Record<string, string>
  [key: string]: unknown
}

/** Fragmento de agente tal como se escribe en `opencode.json` → `agent.<name>`. */
export interface AgentFragment {
  mode?: 'primary' | 'subagent' | 'all'
  description?: string
  prompt?: string
  permission?: AgentPermission
  [key: string]: unknown
}

/** Config de OpenCode (solo lo que tocamos; el resto se preserva tal cual). */
export interface OpenCodeConfig {
  $schema?: string
  agent?: Record<string, AgentFragment>
  [key: string]: unknown
}

/** Manifiesto de instalación (permite desinstalar sin prefijos). */
export interface Manifest {
  version: 1
  installedAt: string
  skills: string[]
  agents: string[]
}
