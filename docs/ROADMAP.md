# ROADMAP — mejoras y deudas (solo desarrolladores)

Documento interno de mantenimiento. Nada de aquí es contrato público.

## Deudas conocidas

### 1. Instalar agentes como markdown en vez de mutar `opencode.json`
- **Estado actual**: el instalador hace merge de la clave `agent` dentro de
  `opencode.json` (con backup y aborto si el JSON es inválido).
- **Mejora propuesta**: instalar cada agente como
  `~/.config/opencode/agents/<nombre>.md` (formato soportado oficialmente por
  OpenCode), que **no** requiere tocar el JSON del usuario. Desinstalar sería
  borrar el `.md`.
- **Bloqueo**: hay que verificar que un `build.md` / `plan.md` sobrescriba los
  agentes built-in de OpenCode. Si no lo hace, mantener el JSON para esos dos y
  markdown para el resto.
- **Por qué no se hizo**: se priorizó replicar el setup que ya funciona en
  producción (JSON), tal y como lo usa el equipo.

### 2. Tests del instalador
- **Estado**: sin tests. `src/lib/*` está modularizado justo para poder testear
  las funciones puras (rutas por ámbito, manifiesto, composición de agentes,
  filtrado de `permission.skill`, copia/borrado de skills).
- **Mejora**: añadir Vitest con tests offline sobre `src/lib/*` y un smoke test
  del CLI contra un directorio temporal.

### 3. Compatibilidad Windows
- **Estado**: rutas contempladas (`%APPDATA%/opencode`), sin probar.
- **Mejora**: validar en Windows; `fs.cpSync` y las rutas con `path` deberían
  funcionar, pero conviene un CI en `windows-latest`.

### 4. Skills con dependencias entre sí
- **Estado**: una skill no puede requerir otra; el agente las autoriza en bloque.
- **Mejora (a evaluar)**: si aparece una necesidad real, declarar dependencias
  en el frontmatter (`metadata.requires`) y resolverlas al instalar.

### 5. `--dry-run`
- **Estado**: no existe; `--force` sí.
- **Mejora**: flag `--dry-run` que imprima qué haría (skills/agentes a
  instalar, colisiones) sin escribir nada.

## Decisiones ya tomadas (no reabrir sin motivo)

- **Sin prefijo** en carpetas de skills ni en claves de agentes (la carpeta debe
  coincidir con el `name` del frontmatter).
- **Manifiesto** `.nova-skills.json` por ámbito para desinstalar con precisión.
- **No destructivo**: backup de `opencode.json` + aborto si no parsea.
- **Solo 56 skills** en el paquete (las de autoría propia/compartida); las
  skills personales (`graphify`, `caveman*`, `codebase-query`) quedan fuera.
- Licencia **GPL-3.0-or-later**; publicación con **pnpm** + Trusted Publishing.
