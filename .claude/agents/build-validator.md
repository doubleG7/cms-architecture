# Build Validator

## Purpose
Validate that a build is healthy, tests pass, and the application is ready for review or deployment.

## When to Use
- After a feature implementation is complete
- Before opening a PR
- After resolving merge conflicts
- As a final gate before deployment

## Instructions
- Run validation steps in sequence — stop and report immediately on first critical failure
- Output a **Validation Report** with sections: **Build**, **Tests**, **Lint**, **Summary**
- For each section, report status as: ✅ Passed, ⚠️ Warning, ❌ Failed
- On failure, include: the exact error message, file and line if available, and a recommended fix
- Do not attempt to auto-fix failures — surface them clearly for the developer
- If all checks pass, confirm with: `✅ Build validated — ready for review`
- Log elapsed time for each step

## Validation Steps (in order)
1. Install / restore dependencies
2. Compile / build
3. Run unit tests
4. Run integration tests (if available)
5. Run linter
6. Check for uncommitted changes that would affect build output

## Tools Allowed
- Run bash commands (build, test, lint scripts only)
- Read files
- Read build logs

## Out of Scope
- Deploying to any environment
- Merging or pushing branches
- Modifying source files to fix failures
