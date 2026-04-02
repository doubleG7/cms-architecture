---
paths:
  - "src/api/**"
  - "src/controllers/**"
  - "src/routes/**"
  - "src/handlers/**"
  - "**/*.controller.ts"
  - "**/*.controller.cs"
  - "**/*.handler.ts"
  - "**/*.handler.cs"
  - "**/*.route.ts"
  - "**/*.routes.ts"
  - "openapi.yaml"
  - "openapi.json"
  - "swagger.yaml"
# paths: frontmatter makes this rule path-scoped.
# Claude loads this file only when working on API/controller/route files.
# This keeps API rules out of context when editing non-API code.
---

# API conventions — Trimble CMS

> Agents: these rules apply whenever you are working on HTTP endpoints, route handlers, or the OpenAPI specification. They do not apply to internal services, utilities, or test files.

---

## Versioning

- **All public endpoints must carry a version prefix:** `/v1/`, `/v2/`, never bare `/invoices`
- **Breaking changes require a new version** — do not modify the shape, required fields, or status codes of an existing versioned endpoint in place
- **Non-breaking additions are fine** on an existing version — adding an optional field to a response, adding an optional query parameter
- The version lives in the URL, not in a header or `Accept` type

Breaking = anything that could cause a correctly-written consumer to fail:
- Removing or renaming a response field
- Changing a field's type
- Making an optional request field required
- Adding a required query parameter
- Changing a success status code (200 → 201, 200 → 204)
- Adding an auth requirement to a previously open endpoint

---

## Route handlers

- **No business logic in route handlers** — delegate immediately to a service
- **No data access in route handlers** — no ORM calls, no raw queries, no repository instantiation
- The handler's job: validate the request shape, call the service, map the result to an HTTP response
- Maximum 20 lines for a typical route handler; if longer, extract

```typescript
// Good
async function exportInvoices(req: Request, res: Response): Promise<void> {
  const params = validateExportParams(req.query);
  const result = await invoiceExportService.export(params);
  res.status(200).json(toExportResponse(result));
}

// Bad — business logic and DB access in handler
async function exportInvoices(req: Request, res: Response): Promise<void> {
  const invoices = await db.query('SELECT * FROM invoices WHERE ...');
  const rows = invoices.map(inv => ({ ...inv, formatted: format(inv.date) }));
  if (rows.length === 0) { res.status(204).send(); return; }
  // ... 40 more lines
}
```

---

## Error envelopes

All error responses — 4xx and 5xx — use this shape:

```json
{
  "error": "Invoice batch export failed for tenantId=t1, dateFrom=2026-01-01",
  "code": 422,
  "traceId": "4b2f3e1a-..."
}
```

- `error`: human-readable description with context — never `"An error occurred"`
- `code`: the HTTP status code (mirrored in the response status)
- `traceId`: the distributed trace ID for this request

**Never expose:**
- Stack traces in error responses
- Internal file paths
- SQL or query text
- Service implementation details

---

## Authentication and authorisation

- **Auth middleware must run before any business logic** — do not check tokens inside handlers or services
- **Authorisation (RBAC/permission checks) runs after authentication** — never skip or reorder
- Return `401 Unauthorized` for missing or invalid tokens (not 403)
- Return `403 Forbidden` for valid tokens with insufficient permissions (not 404)
- **Never leak resource existence to unauthorised callers** — return 403, not 404, if the resource exists but the caller cannot access it

---

## Request validation

- Validate all request input before passing to a service
- Use a schema validation library (Zod, Joi, FluentValidation, DataAnnotations) — no hand-rolled `if (req.body.x === undefined)` chains
- Return `400 Bad Request` with a descriptive error for validation failures
- Validation errors must list which fields failed and why — not just `"Invalid request"`

---

## Pagination

- Use **cursor-based pagination** for all list endpoints — not `offset`/`limit`
- Response shape for paginated lists:

```json
{
  "data": [...],
  "nextCursor": "eyJpZCI6MTIzfQ==",
  "hasMore": true,
  "total": 4821
}
```

- Default page size: `DEFAULT_PAGE_SIZE` (defined in config, not hardcoded)
- Maximum page size: `MAX_PAGE_SIZE` (enforced, return 400 if exceeded)
- Do not return all records with no pagination — all list endpoints are paginated

---

## Response codes

| Scenario | Code |
|---|---|
| Successful read | 200 |
| Successful create | 201 with `Location` header |
| Successful update | 200 |
| Successful delete | 204 (no body) |
| Accepted async operation | 202 with job ID |
| Validation failure | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict (duplicate, stale) | 409 |
| Unprocessable entity (business rule) | 422 |
| Server error | 500 |

---

## OpenAPI specification

- Every new endpoint must have a corresponding entry in `openapi.yaml` before merge
- The spec is the source of truth — code must conform to spec, not the reverse
- Required fields must be marked `required: true` — do not leave it to convention
- All response schemas must be fully defined — no `additionalProperties: true` as a shortcut

---

## What this file does NOT cover

- Security rules (injection, secrets, TLS) → `rules/security.md`
- Layer boundaries → `CLAUDE.md`
- API contract validation agent → `agents/api-contract-tester.md`
