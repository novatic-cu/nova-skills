# 🚀 @novatic/skills

**56 skills y 7 agentes especializados para [OpenCode](https://opencode.ai).**
Full-stack, arquitectura, DBA, DevOps y marketing. Evita código genérico.

```bash
npx @novatic/skills
```

Te pregunta si quieres instalación **global** (`~/.config/opencode`) o **local**
(`./.opencode` + `./opencode.json`).

## 📥 Instalación

```bash
# Todo (skills + agentes). Pregunta el ámbito.
npx @novatic/skills

# Solo un agente (instala también las skills que permite)
npx @novatic/skills agent backend

# Solo una skill
npx @novatic/skills skill nest-mastery

# Sin preguntas: ámbito global
npx @novatic/skills --global --yes
```

Flags: `--global` · `--local` · `--yes`/`-y` · `--force` · `--help` · `--version`

## 🗑️ Desinstalación

```bash
npx @novatic/skills uninstall                    # todo lo instalado por este paquete
npx @novatic/skills uninstall agent backend      # el agente y sus skills huérfanas
npx @novatic/skills uninstall skill nest-mastery # una skill (si ningún agente la usa)
```

No se borra nada que no haya instalado este paquete: lo instalado queda
registrado en un manifiesto (`.nova-skills.json`) en el directorio de config.

## 🤖 Agentes

| Agente | Modo | Rol |
|---|---|---|
| `plan` | **primary** (Tab) | Arquitectura y planificación (sin editar ni ejecutar) |
| `build` | **primary** (Tab) | Implementación y orquestación |
| `backend` | subagent | Servidor, APIs, auth, jobs, microservicios |
| `frontend` | subagent | UI/cliente, estado, data fetching, a11y, CSS |
| `dba` | subagent | Modelado, SQL/NoSQL, rendimiento, integridad |
| `devops` | subagent | Infra, contenedores, CI/CD, observabilidad |
| `marketing` | subagent | Estrategia, branding, copy, pricing, analítica |

Solo `plan` y `build` son **seleccionables manualmente** (Tab). El resto se
invocan con `@backend`, `@frontend`, `@dba`, `@devops`, `@marketing`.

Cada agente limita con `permission.skill` qué skills puede cargar.
Mapa completo: [UTILIDADES.md](./UTILIDADES.md).

## 🧠 Filosofía

- **Sin prefijos**: las skills se instalan con su nombre real
  (`skills/nest-mastery/SKILL.md`), que es lo que OpenCode exige (la carpeta
  debe coincidir con el `name` del frontmatter).
- **No destructivo**: nunca sobrescribe skills/agentes que no instaló este
  paquete (usa `--force` para forzar) y hace **backup** de `opencode.json`
  antes de tocarlo. Si tu JSON está malformado, **aborta** en vez de recrearlo.
- **Desinstalación limpia**: vía manifiesto, sin dejar rastros.
- **Multi-ámbito**: global (todo tu equipo) o local (solo el proyecto).

## ⬆️ Migración desde `@nexusdevelop/mskills`

El paquete antiguo instalaba con prefijo `mskills-` (carpetas y agentes), lo
que incumplía la regla de nombres de OpenCode. Esta versión **no usa prefijo**.

```bash
npx @nexusdevelop/mskills uninstall   # limpia la instalación vieja
npx @novatic/skills                   # instala la nueva
```

## 📚 Documentación

- [Guía de instalación y comandos](./INSTALL.md)
- [Mapa de agentes y skills](./UTILIDADES.md)
- [Uso en otras IAs](./OTROS-CLI-IA.md)
- [Guía de contribución](./COLABORADORES.md)

## 📄 Licencia

GPL-3.0-or-later
