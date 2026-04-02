---
# No paths: frontmatter — this rule file loads at startup on every session.
# It applies universally across all files in this repository.
# Keep under 100 lines. Rules that need more explanation belong in docs/adr/.
---

# Code style — Trimble CMS

> Agents: read and apply these rules to every file you touch.
> Do not assume conventions not stated here. If a rule conflicts with a task requirement, flag it — do not silently break the rule.

---

## Naming

- **Variables and parameters:** camelCase — `invoiceTotal`, `tenantId`, `dateFrom`
- **Classes, interfaces, types, enums:** PascalCase — `InvoiceExportService`, `IRepository<T>`, `ExportStatus`
- **Constants:** SCREAMING_SNAKE_CASE for module-level constants — `MAX_EXPORT_ROWS`, `DEFAULT_PAGE_SIZE`
- **Files:** kebab-case for all source files — `invoice-export.service.ts`, `get-batch-export.handler.cs`
- **Test files:** mirror the source file name with a suffix — `invoice-export.service.unit.test.ts`, `invoice-export.service.integration.test.ts`
- **Database columns:** snake_case — `tenant_id`, `created_at`, `invoice_date`
- **API route segments:** kebab-case, versioned — `/v2/invoice-exports`, `/v1/job-cost-entries`
- **Boolean variables and properties:** prefix with `is`, `has`, `can`, `should` — `isActive`, `hasExportPermission`, `canRetry`
- **Event names:** past tense, dot-namespaced — `invoice.exported`, `payment.received`, `job.cost.updated`

Do not abbreviate unless the abbreviation is universally understood in this domain. `inv` is not `invoice`. `jc` is not acceptable for `jobCost`. Exception: standard acronyms — `id`, `url`, `dto`, `vm`, `db`.

---

## Functions and methods

- **Maximum length:** 40 lines. If a function exceeds 40 lines, it has more than one responsibility — extract.
- **Maximum parameters:** 4. Beyond 4, introduce a parameter object / options struct.
- **Single responsibility:** a function does one thing. Its name describes that thing completely. If the name requires "and", split it.
- **No boolean flag parameters:** `doExport(true, false)` is unreadable. Use named options: `doExport({ includeDrafts: true, compress: false })`.
- **Early return over nesting:** invert conditionals and return early rather than nesting logic 3+ levels deep.
- **Pure where possible:** functions that transform data should have no side effects. Functions with side effects (DB write, event publish, HTTP call) should be clearly named for what they do.

---

## Classes and modules

- **Maximum file length:** 300 lines. Beyond 300 lines, the file has grown beyond a single concern — split it.
- **Single responsibility per class:** one class, one reason to change.
- **No static mutable state:** no module-level variables that accumulate state across calls.
- **Dependency injection:** all dependencies injected via constructor — no `new SomeDependency()` inside a class body, no service locator.
- **Interfaces over concrete types in signatures:** function parameters and return types reference interfaces, not implementations. `IInvoiceRepository`, not `SqlInvoiceRepository`.

---

## Error handling

- **All errors must be typed.** No bare `catch (e)` that swallows or re-throws untyped. Catch specific typed errors and handle each explicitly.
- **No silent swallows:** `catch (e) { /* ignore */ }` is never acceptable. If you choose to swallow, log with context and document why.
- **All I/O must handle errors:** file reads, network calls, database queries — every I/O operation has an error path.
- **Error messages must include context:** `"Export failed"` is not useful. `"Invoice batch export failed for tenantId=${tenantId}, dateFrom=${dateFrom}: ${cause.message}"` is.
- **Public API errors use the standard envelope:** `{ error: string, code: number, traceId: string }`. No raw exceptions, no stack traces, no internal paths in HTTP responses.

---

## Comments

- **Never comment what the code does.** The code says what it does. Comments explain *why* — the reasoning, the constraint, the non-obvious trade-off.
- **Keep comments current.** A comment that contradicts the code is worse than no comment. Delete or update when code changes.
- **TODOs must reference a ticket:** `// TODO(#1184): handle rate limiting once the API gateway throttle is confirmed`. A TODO with no ticket has no owner and will never be addressed.
- **Document public interfaces:** every exported function, class, and interface gets a JSDoc / docstring / XML doc comment describing its contract — what it expects, what it returns, what it throws.

---

## Imports and dependencies

- **Absolute imports over relative for cross-module references:** `import { InvoiceService } from '@trimble/invoices'`, not `'../../../invoices/invoice.service'`.
- **Relative imports within the same module are fine:** `import { toExportRow } from './invoice-export.mapper'`.
- **No circular imports:** if A imports B and B imports A, one of them is violating its responsibility boundary.
- **No barrel re-exports that mask origin:** `index.ts` re-exports for the public module API only — not to flatten the internal folder structure.
- **No unused imports:** every import must be referenced. Remove before committing.

---

## Formatting

Formatting is enforced by the linter/formatter configured in this repo — do not contradict it.
Run the format command from `CLAUDE.md` before any commit.

Rules the formatter does not cover:
- Group imports: stdlib → third-party → internal, with a blank line between groups
- One blank line between methods in a class body
- No trailing whitespace
- Files end with a single newline
- No commented-out code blocks in committed files — delete or use a feature flag

---

## What this file does NOT cover

- Architecture and layer rules → `CLAUDE.md`
- Testing conventions → `rules/testing.md`
- API design rules → `rules/api-conventions.md`
- Security checklist → `rules/security.md`
- Specific ADRs → `docs/adr/`

If a rule here conflicts with an ADR, the ADR wins. Flag the conflict.
