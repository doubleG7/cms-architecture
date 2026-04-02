---
# No paths: frontmatter — this rule file loads at startup on every session.
# It applies universally across all files in this repository.
# Keep under 100 lines.
---

# Testing — Trimble CMS

> Agents: read and apply these rules whenever writing, reviewing, or running tests.
> Do not assume conventions not stated here. If a rule conflicts with a task requirement, flag it.

---

## File placement and naming

- **Unit tests:** co-located with the source file — `invoice-export.service.unit.test.ts` lives next to `invoice-export.service.ts`
- **Integration tests:** `tests/integration/` — mirroring the source folder structure
- **E2E tests:** `tests/e2e/` — named by user journey, not by implementation file
- **Test file naming:** mirror the source file name with a suffix — `.unit.test.ts`, `.integration.test.ts`, `.e2e.spec.ts`
- Do not put unit tests in a top-level `__tests__/` or `tests/` folder — keep them co-located

---

## Coverage thresholds

| Layer | Threshold |
|---|---|
| Service layer (business logic) | 80% line + branch |
| Repository layer (data access) | 70% line |
| Controllers / route handlers | 60% line |
| Utilities and helpers | 80% line |
| Entry points (`index.ts`, `main.ts`) | Excluded |
| Generated files, migrations, vendored | Excluded |

Coverage is a floor, not a goal. 80% on a service layer with no assertion-less tests is better than 95% with half the tests asserting nothing.

---

## Unit test rules

- **One assertion concept per test.** A test may have multiple `expect` calls if they all prove the same thing. Split if they prove different things.
- **Test names describe what they prove** — `'returns empty array when no invoices found for date range'`, not `'test 1'` or `'works'`
- **Mock all external dependencies** — no live network calls, no real DB connections, no real file I/O in unit tests
- **No shared mutable state** — no module-level `let` that accumulates across tests; reset in `beforeEach`
- **No `setTimeout` or `Date.now()` unpinned** — freeze or mock time; deterministic tests only
- **Test the contract, not the implementation** — test what a function returns and what side effects it produces, not how it does it internally

---

## Integration test rules

- **Real test database only** — no in-memory substitutes (SQLite standing in for Postgres is not acceptable); schema must match production
- **Isolated transactions** — each test wraps in a transaction and rolls back; no test leaves data behind for the next
- **No shared test data files** — use factories or builders to create test data inline; do not rely on seed files that accumulate state
- **Auth must be tested at the boundary** — integration tests for HTTP endpoints must include at least one test with a valid token and one with no/invalid token
- **No mocks at the service–repository boundary** — integration tests test the actual boundary; mock only third-party external services

---

## E2E test rules

- **Exercises the running application** — no mocking of any kind; real app, real DB, real HTTP
- **One journey per test file** — each E2E spec is a complete user journey from entry to observable outcome
- **Use `data-testid` selectors** — not CSS classes or text content; these are intentional test hooks
- **Clean up after each test** — each E2E test leaves the application in the same state it found it
- **Never run E2E tests against production** — always a dedicated test environment

---

## Forbidden patterns

- `catch (e) { /* ignore */ }` in test code — either assert on the error or let it propagate
- Tests that only pass because the assertion is inside a `try` that swallows the throw
- `expect(true).toBe(true)` — placeholder assertions that prove nothing
- Asserting implementation details: checking that a private method was called, verifying internal state not exposed via the public API
- `jest.setTimeout(30000)` — if a unit test needs 30 seconds, it is not a unit test

---

## What this file does NOT cover

- Test agent behaviour → `agents/unit-test-writer.md`, `agents/integration-test-writer.md`
- Coverage audit → `agents/test-coverage-reporter.md`
- E2E tooling setup → `agents/e2e-test-writer.md`
- Security testing → `rules/security.md`
