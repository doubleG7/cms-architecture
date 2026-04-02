---
# No paths: frontmatter — this rule file loads at startup on every session.
# It applies universally across all files in this repository.
# Keep under 100 lines.
---

# Security rules — Trimble CMS

> Agents: read and apply these rules to every file you touch.
> Self-check against this list before every PR.
> If you detect a violation, fix it immediately and note it in the PR description.
> These are not style preferences — they are correctness requirements.

---

## Injection

- **No SQL string concatenation.** Use parameterised queries or a query builder in all cases.
  ```typescript
  // FORBIDDEN
  db.query(`SELECT * FROM invoices WHERE tenant_id = '${tenantId}'`);
  // REQUIRED
  db.query('SELECT * FROM invoices WHERE tenant_id = $1', [tenantId]);
  ```
- **No `eval()` on user-supplied input.** Ever. No exceptions.
- **No `child_process.exec()` with user input.** Use `execFile` with argument arrays, never string interpolation into shell commands.
- **No dynamic `require()` or `import()` with user-controlled paths.**
- **No template rendering with raw user HTML.** Escape all user content before rendering; use `textContent`, not `innerHTML`.

---

## Credentials and secrets

- **No credentials, tokens, API keys, or secrets in source code** — not in strings, not in comments, not in test fixtures committed to git
- **No hardcoded connection strings** — use environment variables or a secrets manager
- Use `.env.example` for templates; `.env` is gitignored and never committed
- If a secret is found in code history, it must be rotated — deleting the commit is not sufficient
- Personal access tokens and service account keys must never appear in any file, even temporarily

---

## Authentication and authorisation

- **Authentication middleware must run before any handler.** Do not make auth optional by skipping middleware registration.
- **`rejectUnauthorized: false` is never acceptable** in production TLS configuration. In test code only, and must be accompanied by a comment explaining why.
- **JWT signature must always be verified** — `algorithm: 'none'` is forbidden. Pin the algorithm explicitly.
- **Session tokens must be invalidated on logout** — do not rely solely on token expiry.
- **CORS origins must be explicit** — `origin: '*'` is forbidden in production configuration.

---

## Input validation

- **All user input must be validated before use** in queries, file paths, shell commands, or template rendering.
- **File path inputs must be sanitised** — reject `..` traversal sequences; resolve to an absolute path and assert it is within the allowed base directory.
- **Redirect URLs must be validated** — only redirect to known-safe origins; never redirect to a URL provided directly by the user without validation.
- **Upload file types must be validated by content, not extension** — check MIME type and magic bytes, not the filename suffix.

---

## Cryptography

- **No MD5 or SHA-1 for security purposes** (checksums on non-sensitive data are acceptable).
- **Passwords must be hashed with a slow algorithm** — bcrypt, Argon2, or scrypt. Never SHA-256 or similar fast hashes for passwords.
- **Encryption keys must be at least 256 bits.** No hardcoded IV or nonce — generate cryptographically random values per operation.
- **No homebrew cryptography.** Use well-maintained, audited libraries only.

---

## Dependencies

- **No packages with known critical CVEs.** Run `npm audit` / `pip-audit` / `dotnet list package --vulnerable` before merge.
- **Pin dependency versions** in lock files — do not use `*` or unanchored `^` ranges for security-sensitive packages.
- **Review new dependencies before adding** — check download count, maintenance activity, and known issues.
- New dependencies must be noted in the PR description.

---

## Logging

- **Never log credentials, tokens, passwords, or PII** — not even at DEBUG level.
- **Error logs must include context** but must not include raw user input that could contain sensitive data.
- Log the `traceId` on every error — it is the link between the user-facing error and the server-side log.

---

## HTTP headers

- `Content-Security-Policy` must be set on all HTML responses.
- `X-Content-Type-Options: nosniff` must be set on all responses.
- `Strict-Transport-Security` must be set on all production HTTPS responses.
- Do not expose `X-Powered-By`, `Server`, or other fingerprinting headers.

---

## Agent self-check before PR

- [ ] No SQL concatenation in any changed file
- [ ] No credentials or secrets in any changed file or comment
- [ ] No `eval()` on user input
- [ ] No `rejectUnauthorized: false` outside test code
- [ ] All user input validated before use in queries, paths, or commands
- [ ] No new dependency with a known critical CVE
- [ ] Auth middleware not removed or reordered

---

## What this file does NOT cover

- Detailed security scanning → `agents/security-scanner.md`
- API-specific security patterns (CORS, headers) → `rules/api-conventions.md`
- OWASP Top 10 detailed guidance → `docs/adr/security-baseline.md`
