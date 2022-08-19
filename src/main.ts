/**
 * Copyright (C) 2020-2022, TomTom (http://tomtom.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const core = require("@actions/core");

import { prepare_environment } from "./environment";
import {
  retrieve_changelog,
  validate_changelog,
  create_github_release,
  has_unreleased_version,
  release_changelog,
} from "./changelog";

async function run() {
  try {
    console.log("🌲 Preparing environment...");
    await prepare_environment();

    console.log("🚀 Validating CHANGELOG.md...");
    await retrieve_changelog();

    await validate_changelog();
    console.log(
      "✅ Your CHANGELOG.md complies to the keepachangelog convention"
    );

    const can_release = await has_unreleased_version();
    const publish_release = JSON.parse(core.getInput("publish"));
    if (!can_release || !publish_release) {
      return;
    }

    console.log("🏁 Releasing your CHANGELOG.md");
    await release_changelog();

    console.log("📦 Creating a new GitHub Release...");
    const released_version = await create_github_release();

    console.log("🚢 Published the GitHub Release!");

    core.setOutput("version", released_version);
  } catch (ex) {
    core.setFailed((ex as Error).message);
  }
}

run();
