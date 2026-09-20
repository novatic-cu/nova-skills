# 📋 Guía de instalación y comandos

## Requisitos

- Node.js `>= 20`
- OpenCode (global: `~/.config/opencode` · local: `./.opencode`)

## Instalación completa

```bash
npx @novatic/skills
```

Pregunta si quieres instalación **global** o **local**. Para saltar la pregunta:

```bash
npx @novatic/skills --global --yes
npx @novatic/skills --local  --yes
```

## Instalación de un agente

```bash
npx @novatic/skills agent backend
```

Instala el agente en `opencode.json` **y** las skills que permite.

## Instalación de una skill

```bash
npx @novatic/skills skill nest-mastery
```

Copia la carpeta completa de la skill (`SKILL.md` + `scripts/`, `references/`, …)
a `skills/<nombre>/`.

## Desinstalación

```bash
npx @novatic/skills uninstall                     # todo
npx @novatic/skills uninstall agent backend       # un agente + skills huérfanas
npx @novatic/skills uninstall skill nest-mastery  # una skill (si nadie la usa)
```

- `uninstall skill` **se niega** si algún agente de la config usa esa skill.
- `uninstall agent` borra después las skills que ya no usa ningún otro agente.

## Qué toca en disco

| Ámbito | Skills | Config | Manifiesto |
|---|---|---|---|
| global | `~/.config/opencode/skills/<nombre>/` | `~/.config/opencode/opencode.json` | `~/.config/opencode/.nova-skills.json` |
| local | `./.opencode/skills/<nombre>/` | `./opencode.json` | `./.opencode/.nova-skills.json` |

## Seguridad

- Antes de escribir `opencode.json` hace **backup** (`opencode.json.bak-<fecha>`).
- Si tu `opencode.json` no es JSON válido, **aborta** con un mensaje; nunca lo
  recrea ni lo vacía.
- Solo modifica la clave `agent`; el resto de tu config (tema, MCP, permisos
  globales, `default_agent`, `instructions`…) queda intacta.
- `--force` sobrescribe skills/agentes preexistentes que no instaló el paquete.

## Ejemplos de uso

Selecciona `plan` o `build` con **Tab** en OpenCode, o invoca un subagente con
`@backend`, `@frontend`, `@dba`, `@devops`, `@marketing`.
