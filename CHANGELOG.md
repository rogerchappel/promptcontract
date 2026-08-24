# Changelog

## Unreleased

- Make smoke and release checks reject missing or broken passing fixtures while
  continuing to require the intentionally failing fixture to exit with status 1.

- Make `check` fail with a `no-files-matched` diagnostic when its glob patterns
  resolve to zero prompt files.

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Added

- Initial project setup.
- Package smoke now verifies the dry-run pack manifest before release.

### Changed

- Exclude compiled test artifacts from the published package contents.

## Release Links

- Unreleased:
  `https://github.com/rogerchappel/promptcontract/compare/...HEAD`
- Latest release:
  `https://github.com/rogerchappel/promptcontract/releases/latest`

Replace placeholder links once the first release tag exists.
