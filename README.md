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

The workflow, usually declared in `.github/workflows/build.yml`, looks like:


## Inputs


[keepachangelog convention]: http://keepachangelog.com/
[(Keep a) Changelog Manager]: https://pypi.org/project/commisery/
