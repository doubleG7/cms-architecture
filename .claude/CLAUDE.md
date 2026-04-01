# CLAUDE.md — Architecture Standards

> **For agents:** Read this file fully before any task in this repository.
> Do not assume conventions not stated here.
> Last updated: YYYY-MM-DD | Owner: [Architecture lead]

---

## Repository overview

**Purpose:** [One sentence — what does this repo do?]
**Language(s):** [e.g. TypeScript, Python, C#, Go]
**Architecture pattern:** [e.g. vertical slice, clean architecture, modular monolith, hexagonal]
**Deployment:** [e.g. Kubernetes, Lambda, Cloud Run, bare metal]
**ADRs:** `docs/adr/` — consult before proposing structural changes

---

## Layer boundaries

- Controllers / route handlers must **not** instantiate database contexts, ORMs, or data clients directly
- All data access must go through a repository, DAO, or data-access layer
- Business logic must **not** live in controllers, route handlers, or views
- Services must **not** reference HTTP request/response objects
- Infrastructure concerns (logging, config, auth) must not bleed into domain logic

## Module boundaries

- Modules must **not** import from other modules' internal/private packages
- Cross-module communication must use defined interfaces, events, or a shared kernel
- Circular dependencies between modules are **not** permitted
- Shared code belongs in `shared/` or `common/`, never copied between modules

## Class and function size

- Functions longer than **50 lines** → flag for extraction
- Classes longer than **300 lines** → split by single responsibility
- Files longer than **500 lines** → review for cohesion
- Maximum **3 levels** of nesting in any function body

## API design

- All new public endpoints **must** carry a version prefix: `/v1/`, `/v2/`
- Route handlers must **not** contain business logic — delegate to a service
- Endpoints must return **structured error envelopes**, not raw exceptions
- Breaking changes to existing endpoints require a **new version**, not in-place modification
- Pagination, filtering, and sorting must follow the existing API conventions

## Dependency injection

- Dependencies **must** be injected via constructor or function parameter
- **No** service locator pattern (global registries, static resolvers)
- **No** global mutable state or singletons for business objects
- New third-party packages must be noted in the PR description

## Error handling

- Errors **must** be typed — no bare `except`/`catch` that silently swallows
- All I/O (file, network, DB, queue) must have error handling
- Errors must be **logged with context** before being swallowed
- Public API errors must use a **consistent error envelope structure**

## Async patterns

- All I/O must use `async/await` — **no** blocking calls on async threads
- **No** fire-and-forget async calls unless explicitly documented with a comment
- All async errors must be handled — no unhandled promise rejections or unobserved tasks

## Configuration

- **No** hardcoded credentials, connection strings, or secrets in source code
- **No** magic numbers — operational parameters belong in config or environment variables
- **No** environment-specific values committed — use `.env.example` for templates
- Feature flags must use the approved feature flag service, **not** environment variables

## Testing

- New public functions must have **at least one test**
- Tests must **not** depend on live external network calls or shared mutable state
- Test files must map clearly to the source they test (co-located or mirrored folder)
- Integration tests must be isolated from unit tests (separate folder or naming convention)

## Security

- **No** SQL string concatenation — use parameterised queries only
- **No** `eval()` or dynamic code execution on user-supplied input
- **No** credentials, tokens, or secrets in code strings or comments
- User input must be validated before use in queries, commands, or file paths
- Authentication and authorisation middleware must **not** be bypassed or disabled

---

## Known gotchas

<!-- Add repo-specific traps here. Examples: -->
- [e.g. "The legacy auth middleware must run before the RBAC middleware — do not reorder"]
- [e.g. "Use `_readCtx` for queries and `_writeCtx` for mutations — they are different connections"]
- [e.g. "The `UserService` constructor has a circular dependency workaround — do not 'fix' it"]

---

## Build and run

```bash
# Install
[install command]

# Run locally
[run command]

# Run tests
[test command]

# Lint / format
[lint command]
```

---

## Agent instructions

### Agents may
- Generate implementation code following conventions above
- Generate unit and integration tests co-located with source
- Generate documentation updates for changed interfaces
- Propose ADRs for novel architectural decisions (open a draft, flag for human review)
- Update this CLAUDE.md with new gotchas after corrections ("Update CLAUDE.md so you don't make that mistake again")

### Agents must not
- Modify files in `/infra/` without explicit human instruction
- Disable or bypass authentication, authorisation, or security middleware
- Introduce new dependencies without noting them for human approval
- Commit directly to `main`, `master`, or `release/*` branches
- Assume conventions not stated in this file

### Before every PR, agents self-verify
- [ ] All new code has corresponding tests
- [ ] No secrets, tokens, or credentials in code or comments
- [ ] No security controls disabled or bypassed
- [ ] All conventions in this file are followed
- [ ] Any conflicts with existing code are documented in the PR description
- [ ] New dependencies are noted in the PR description

---

## Key contacts

| Role | Contact |
|---|---|
| Engineering lead | [Name / @handle] |
| Architecture owner | [Name / @handle] |
| Security point of contact | [Name / @handle] |

---

*This file is versioned alongside the code. Changes require a PR review.
Substantive convention changes should produce or reference an ADR in `docs/adr/`.*
