<!--
Copyright (C) 2020-2022, TomTom (http://tomtom.com).

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Manage your CHANGELOG.md using the Keepachangelog Convention

This GitHub Action allows you to setup a full release workflow based around your `CHANGELOG.md`, incl:

- Validation of your `CHANGELOG.md` file against the [keepachangelog convention]
- Creation of a Draft-release based on the `[Unreleased]` version in your `CHANGELOG.md`
- Releasing the `[Unreleased]` version in your `CHANGELOG.md`

## Prerequisites

* [(Keep a) Changelog Manager] requires at least `Python>3.7`
* `pip` needs to be installed for this Python version 

## Usage

### Validating your CHANGELOG.md

You can use the following workflow syntax to validate your CHANGELOG.md:

```yml
name: Quality Checks
on:
  pull_request:
    types: [edited, opened, synchronize, reopened]

jobs:
  changelog:
    name: Validate Changelog
    runs-on: ubuntu-latest

    steps:
      - name: Setup Python v3.7
        uses: actions/setup-python@v3
        with: {python-version: '3.7'}

      - name: Validate Changelog
        uses: tomtom-international/keepachangelog-action
        with: {token: ${{ github.token }}}
```

> :bulb: *Any non-conformity will automatically appear as file annotation in your Pull Request*

### Create a DRAFT release

This action can automatically manage your draft releases, by creating a new release upon merge to your
main branch. An example workflow:

```yml
name: Create Draft release based on the CHANGELOG.md
concurrency: deployment

on:
  push:
    branches:
      - main

jobs:
  changelog:
    name: Update draft releases
    runs-on: ubuntu-latest

    steps:
      - name: Setup Python v3.7
        uses: actions/setup-python@v3
        with:
          python-version: '3.7'

      - name: Update DRAFT releases based on your CHANGELOG.md
        uses: tomtom-international/keepachangelog-action
        with:
          deploy: draft
          token: ${{ github.token }}
```

> :warning: *This will DELETE all your current DRAFT releases and only create a new DRAFT release in case an `[Unreleased]` version exists*

### Release a DRAFT release

This action provides the ability to automatically create a Pull Request to update your
CHANGELOG.md according to the latest GitHub release.

Example workflow:

```yml
name: Release Changelog

concurrency: deployment

on:
  release:
    types: [released]

jobs:
  update-changelog:
    name: Release Changelog
    runs-on: ubuntu-latest

    steps:
      - name: Setup Python v3.7
        uses: actions/setup-python@v3
        with:
          python-version: '3.7'

      - name: Validate Changelog
        uses: tomtom-international/keepachangelog-action
        with:
          deploy: release
          token: ${{ github.token }}
```

## Inputs

| Name | Required | Description |
| --- | --- | --- |
| token | :white_check_mark: | GitHub token used to access GitHub (eg. github.token) |
| deploy | :o: | Deployment type (`draft` or `release`) to execute. Executes the validation step only if this input is not provided |
| message | :o: | Message to use while creating the Pull Request to update your CHANGELOG.md, defaults to: `docs(release): update CHANGELOG.md for {version}`



[keepachangelog convention]: http://keepachangelog.com/
[(Keep a) Changelog Manager]: https://pypi.org/project/commisery/
