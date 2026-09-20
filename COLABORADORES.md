# 🤝 Guía de contribución

## Filosofía

- **Calidad sobre cantidad**: cada skill debe aportar valor real.
- **No duplicidad**: no crear skills que ya existan con otro nombre.
- **Seguridad primero**: nunca incluir código que comprometa la seguridad.

## Añadir una skill

1. Fork del repositorio.
2. Crear `skills/<nombre>/SKILL.md`, donde `<nombre>` es **exactamente** el
   `name` del frontmatter (regla de OpenCode: la carpeta debe coincidir con el
   nombre). Regex válida: `^[a-z0-9]+(-[a-z0-9]+)*$`.
3. Frontmatter obligatorio:

   ```markdown
   ---
   name: mi-skill
   description: Qué hace y cuándo usarla (1–1024 caracteres).
   ---

   ## Qué hago
   ...
   ```

4. Si la skill necesita archivos extra (`scripts/`, `references/`, …), van
   dentro de la misma carpeta: el instalador copia el directorio completo.
5. Añadirla al `permission.skill` del/los agente(s) que deban usarla
   (`agents/<agente>.json`).

## Añadir un agente

1. Crear `agents/<nombre>.json` con el **schema real** de OpenCode:

   ```json
   {
     "mode": "subagent",
     "description": "Qué hace y cuándo usarlo (obligatoria).",
     "prompt": "System prompt del agente.",
     "permission": {
       "skill": {
         "*": "deny",
         "clean-architecture": "allow"
       }
     }
   }
   ```

   - `mode`: `primary` (seleccionable con Tab) o `subagent` (se invoca con `@`).
   - **No** usar `instructions` ni `skills[]`: no existen en OpenCode.

## Proceso de PR

1. `pnpm install`
2. `pnpm build`
3. Conventional Commits.
4. PR detallado con justificación.

## Ideas pendientes

Ver [docs/ROADMAP.md](./docs/ROADMAP.md).
