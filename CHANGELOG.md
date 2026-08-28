# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Added

- Initial project setup.
- Package smoke now verifies the dry-run pack manifest before release.
- `check` fails with a `no-files-matched` diagnostic when its glob patterns
  resolve to zero prompt files.

### Changed

- Reject non-boolean input requirements, unsupported contract fields, and
  undeclared example inputs with stable codes and exact diagnostic paths.
- Exclude compiled test artifacts from the published package contents.
- Smoke and release checks reject missing or broken passing fixtures while
  continuing to require the intentionally failing fixture to exit with status 1.
- CLI `--version` now derives from `package.json` instead of a hardcoded value.
