# Manage your CHANGELOG.md using the Keepachangelog Convention

This GitHub Action allows you to setup a full release workflow based around your `CHANGELOG.md`, incl:

- Validation of your `CHANGELOG.md` file against the [keepachangelog convention]
- Creation of a Draft-release based on the `[Unreleased]` version in your `CHANGELOG.md`
- Releasing the `[Unreleased]` version in your `CHANGELOG.md`

## Prerequisites

* [(Keep a) Changelog Manager] requires at least `Python>3.7`
* `pip` needs to be installed for this Python version 

## Usage

The workflow, usually declared in `.github/workflows/build.yml`, looks like:


## Inputs


[keepachangelog convention]: http://keepachangelog.com/
[(Keep a) Changelog Manager]: https://pypi.org/project/commisery/
