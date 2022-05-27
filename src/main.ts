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
  create_draft_release,
  release_changelog,
} from "./changelog";

async function run() {
  // Ensure that keepachangelog-manager is installed
  try {
    console.log("🌲 Preparing environment...");
    await prepare_environment();
    console.log("🚀 Validating CHANGELOG.md...");
    await retrieve_changelog();
    await validate_changelog();
    console.log(
      "✅ Your CHANGELOG.md complies to the keepachangelog convention"
    );
    const deployment_type = core.getInput("deploy");
    if (deployment_type.toLowerCase() === "draft") {
      create_draft_release();
      console.log("📦 Updated your draft release!");
    } else if (deployment_type.toLowerCase() === "release") {
      release_changelog();
      console.log("🚢 Released latest CHANGELOG.md");
    }
  } catch (ex) {
    core.setFailed((ex as Error).message);
  }
}

run();
