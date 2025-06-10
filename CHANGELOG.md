# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Upgraded keepachangelog-manager to v4

## [2.0.0] - 2025-06-10
### Removed
- Removed support for Node16

### Added
- Added Support for Node20

### Security
- Upgrade `@actions/github` to address security concerns (CVE-2025-25290, CVE-2025-25288, CVE-2025-25289)

## [1.2.1] - 2022-09-01
### Changed
- Renamed action to `Keepachangelog Manager`

## [1.2.0] - 2022-08-19
### Added
- You can now format the external representation of your tag (`tag`-input) and GitHub Release name (`release-name`)

### Changed
- In order to remain consistent, we have renamed the `message` input to `commit-message`

## [1.1.0] - 2022-08-19
### Added
- The semantic version of the latest published release can be retrieved with the `version` output parameter

## [1.0.0] - 2022-08-19
### Added
- Ability to publish your CHANGELOG.md directly to your main branch (input option `publish`), before creating/updating a GitHub Release

### Fixed
- This GitHub action no longer deletes all `DRAFT` GitHub Releases

### Removed
- Support for releasing your CHANGELOG.md using Pull Requests (incl. the `deploy` input parameter)

## [0.0.4] - 2022-07-20
### Changed
- Updated project for latest node version (18.0.6)

## [0.0.3] - 2022-05-28
### Changed
- Added usage instructions for a release workflow to the documentation

## [0.0.2] - 2022-05-28
### Changed
- GitHub Actions releases process now allows uses to use the MAJOR version (i.e. `v1`)

## [0.0.1] - 2022-05-28
### Added
- Validation of the CHANGELOG.md based on keepachangelog convention
- Ability to create/update a draft GitHub release based on the CHANGELOG.md
- Allow releasing (using PRs) of the CHANGELOG.md
