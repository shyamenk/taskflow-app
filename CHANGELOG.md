# Changelog

## [Unreleased]

### Changed

- Docs now describe GitHub Actions, not CircleCI, as the planned CI.

### Added

- Multi-stage container image: Node build stage, non-root nginx runtime on port 8080, security headers and cache rules in `nginx.conf`, and `npm run test:image` to check it.
- Minimal to-do app (React + Vite): add, complete and delete tasks, saved in `localStorage`.
- Tests for each behaviour, oxlint with zero warnings allowed, and Prettier.
