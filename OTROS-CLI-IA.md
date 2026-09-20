# 🤖 Uso de @novatic/skills en otras IAs de terminal

> ⚠️ **Aviso**: compatibilidad no probada exhaustivamente. Guía teórica.

## Teoría

Cada skill es una carpeta con un `SKILL.md` dentro. Cualquier IA de terminal que
lea archivos `.md` de contexto puede consumirlas, apuntándola a la carpeta de
skills instalada.

Tras instalar con `@novatic/skills`, las skills quedan en:

- global: `~/.config/opencode/skills/`
- local: `./.opencode/skills/`

## Claude Code

Usar `CLAUDE.md` referenciando la carpeta de skills.

```markdown
# CLAUDE.md
Revisa la carpeta ./.opencode/skills/ para contexto técnico especializado.
```

## Aider

Añadir las skills al chat.

```bash
aider --file .opencode/skills/nest-mastery/SKILL.md --file .opencode/skills/clean-architecture/SKILL.md
```

## Cursor / Windsurf

Usar `.cursorrules` apuntando a los archivos `.md`.

```markdown
# .cursorrules
Cuando necesites contexto técnico especializado, lee los archivos de ./.opencode/skills/.
```

## OpenClaw / KimiCode

Si usan una configuración similar a la de OpenCode, debería funcionar directo o
basta con apuntarlos a la carpeta de skills.

---

**Nota**: si lo pruebas en otra IA y funciona, documéntalo en [COLABORADORES.md](./COLABORADORES.md).
