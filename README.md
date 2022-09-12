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
- Releasing the `[Unreleased]` version in your `CHANGELOG.md`
- Publication of a GitHub Release, associated with the previously released version

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

jobs:
  changelog:
    name: Validate Changelog
    runs-on: ubuntu-latest

    steps:
      - name: Setup Python v3.7
        uses: actions/setup-python@v3
        with:
          python-version: '3.7'

      - name: Validate Changelog
        uses: tomtom-international/keepachangelog-action
        with:
          token: ${{ github.token }}
```

> :bulb: *Any non-conformity will automatically appear as file annotation in your Pull Request*


### Release your CHANGELOG.md

This action provides the ability to automatically release the contents of the `[Unreleased]` version.
As result:
- Your `CHANGELOG.md` is automatically updated and pushed to your main branch
- A GitHub Release is created on the commit hash of the previous update commit.

Example workflow:

```yml
name: Release Changelog

concurrency: deployment

on:
  push:
    branches:
      - main

jobs:
  release-changelog:
    name: Release Changelog
    runs-on: ubuntu-latest

    steps:
      - name: Setup Python v3.7
        uses: actions/setup-python@v3
        with:
          python-version: '3.7'

      - name: Release Changelog
        uses: tomtom-international/keepachangelog-action
        with:
          publish: true
          token: ${{ github.token }}
```

## Inputs

| Name | Required | Description |
| --- | --- | --- |
| token | :white_check_mark: | GitHub token used to access GitHub (eg. github.token) |
| path | :o: | Full path towards the CHANGELOG.md file |
| publish | :o: | `Boolean` indicating whether to release and publish the latest `[Unreleased]` version. Executes the validation step only if this input is not provided |
| tag | :o: | Formatter used for applying the tag name, defaults to: `{version}`
| release-name | :o: | Formatter used for applying the GitHub Release name, defaults to: `Release {tag}`
| commit-message | :o: | Message to use while creating the Pull Request to update your CHANGELOG.md, defaults to: `docs(release): update CHANGELOG.md for '{release-name}'`

## Outputs

| Name | Description |
| --- | --- |
| version | Contains the Semantic Version of the latest release. This is only set in case `publish: true`. |


[keepachangelog convention]: http://keepachangelog.com/
[(Keep a) Changelog Manager]: https://pypi.org/project/keepachangelog-manager/
