# 🧠 Mapa de agentes y skills

## Agentes

### `plan` — primary (Tab)
- **Rol**: Arquitectura y planificación (no edita ni ejecuta).
- **Skills**: project-bootstrap, requirements-analyst, system-architect, domain-driven-design, clean-architecture, api-contract-first, technical-debt-manager, project-context, project-techstack, project-db-schema

### `build` — primary (Tab)
- **Rol**: Implementación y orquestación.
- **Skills**: clean-architecture, git-workflow, debugging-protocol, testing-mindset, self-validation, code-logic-documentation, project-context, project-techstack, project-db-schema

### `backend` — subagent
- **Rol**: Servidor, APIs, auth, jobs, microservicios.
- **Skills**: nest-mastery, python-engineering, auth-security-zero-trust, microservices-resilience, caching-strategies, error-handling-resilience, background-jobs, api-reference-documentation, query-optimization, migration-safety

### `frontend` — subagent
- **Rol**: UI/cliente, estado, data fetching, a11y, CSS.
- **Skills**: nextjs-rsc-mastery, state-management, frontend-data-fetching, ui-ux-engineering, accessibility-a11y, css-architecture, design-system-builder, technical-seo

### `dba` — subagent
- **Rol**: Datos.
- **Skills**: relational-data-modeling, nosql-data-modeling, query-optimization, database-scaling, migration-safety, data-integrity, data-privacy

### `devops` — subagent
- **Rol**: Infra, contenedores, CI/CD, observabilidad.
- **Skills**: cloud-architecture, containerization, cicd-automation, infrastructure-as-code, observability-stack, cost-optimization, disaster-recovery, infra-deploy-runbooks

### `marketing` — subagent
- **Rol**: Negocio.
- **Skills**: brand-identity, growth-marketing, conversion-copywriting, content-strategy, pricing-strategy, product-analytics, go-to-market, technical-seo

## Skills agrupadas

### Ingeniería
project-bootstrap, requirements-analyst, system-architect, domain-driven-design, clean-architecture, api-contract-first, technical-debt-manager, project-context, project-techstack, project-db-schema, git-workflow, debugging-protocol, testing-mindset, self-validation, code-logic-documentation

### Backend
nest-mastery, python-engineering, auth-security-zero-trust, microservices-resilience, caching-strategies, error-handling-resilience, background-jobs, api-reference-documentation

### Frontend
nextjs-rsc-mastery, state-management, frontend-data-fetching, ui-ux-engineering, accessibility-a11y, css-architecture, design-system-builder

### Base de datos
relational-data-modeling, nosql-data-modeling, query-optimization, database-scaling, migration-safety, data-integrity, data-privacy

### Arquitectura / infraestructura
cloud-architecture, containerization, cicd-automation, infrastructure-as-code, observability-stack, cost-optimization, disaster-recovery, infra-deploy-runbooks

### Marketing
brand-identity, growth-marketing, conversion-copywriting, content-strategy, pricing-strategy, product-analytics, go-to-market

### Documentación
technical-seo (presente en frontend y marketing)

## Cómo se relacionan

OpenCode descubre las skills automáticamente desde `skills/<nombre>/SKILL.md`.
Los agentes **no** listan skills en su definición: las autorizan con
`permission.skill` (comodín `"*": "deny"` + `"<skill>": "allow"`). Así, una
skill instalada queda disponible solo para los agentes que la permiten.
