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
const exec = require("@actions/exec");
const github = require("@actions/github");
const fs = require("fs");

const github_token = core.getInput("token");
const octokit = github.getOctokit(github_token);

const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
const repository = {
  owner: owner,
  repo: repo,
};

/**
 * Retrieves the CHANGELOG.md from the current repository
 */
export async function retrieve_changelog() {
  const ref = process.env.GITHUB_REF;
  try {
    const { data: changelog } = await octokit.rest.repos.getContent({
      ...repository,
      path: "CHANGELOG.md",
      ref: ref,
    });

    fs.writeFileSync("CHANGELOG.md", Buffer.from(changelog.content, "base64"));
  } catch (error: any) {
    if (error.message === "Not Found") {
      throw new Error(
        `No CHANGELOG.md found for ${repository.owner}/${repository.repo}@${ref}`
      );
    }
  }
}

/**
 * Validates the CHANGELOG.md against the keepachangelog convention
 */
export async function validate_changelog() {
  const { exitCode: status, stderr: errors } = await exec.getExecOutput(
    "python3",
    ["-m", "changelogmanager", "--error-format", "github", "validate"],
    {
      ignoreReturnCode: true,
      silent: true,
    }
  );

  if (status !== 0) {
    console.log(errors);
    throw new Error(
      `Your CHANGELOG.md does not comply to the keepachangelog convention`
    );
  }
}

/**
 * Converts the CHANGELOG to JSON object
 */
async function changelog_to_json() {
  await exec.getExecOutput("python3", ["-m", "changelogmanager", "to-json"], {
    ignoreReturnCode: true,
    silent: true,
  });

  return await JSON.parse(fs.readFileSync("CHANGELOG.json", "utf-8"));
}

/**
 * Generates one category for the GitHub Release body, i.e.:
 *
 * ### :warning: Deprecation
 * * Something will be removed in the next release of...
 */
function release_entry(data: any, emoji: string, title: string) {
  if (!data) {
    return "";
  }

  var message = `### :${emoji}: ${title}\n`;
  for (var item of data) {
    message += `* ${item}\n`;
  }
  message += "\n";

  return message;
}

/**
 * Creates the body of a GitHub Release
 */
function compose_release_changelog(release: any) {
  var body = "## What's changed\n\n";

  body += release_entry(release.removed, "no_entry_sign", "Removed");
  body += release_entry(
    release.security,
    "closed_lock_with_key",
    "Security Changes"
  );
  body += release_entry(release.deprecated, "warning", "Deprecation");
  body += release_entry(release.added, "rocket", "New Features");
  body += release_entry(release.changed, "scissors", "Updated Features");
  body += release_entry(release.fixed, "bug", "Bug Fixes");

  return body;
}

/**
 * Retrieves the latest unreleased (draft) GitHub release which
 * uses the standard naming pattern (`Release vXYZ`)
 */
export async function get_unreleased_github_release(releases: string[]) {
  const github_releases = await octokit.rest.repos.listReleases({
    ...repository,
  });
  const release_version_re = /Release v(.*)/;

  for (var github_release of github_releases.data) {
    if (github_release.draft) {
      const match = release_version_re.exec(github_release.name);

      if (match && !releases.includes(match[1])) {
        return github_release.id;
      }
    }
  }
}

/**
 * Returns `True` when the provided version is Unreleased
 */
function is_unreleased_version(version: any) {
  return version && version.metadata.version === "unreleased";
}

/**
 * Returns `True` when the CHANGELOG.md contains an Unreleased version
 */
export async function has_unreleased_version() {
  const changelog = await changelog_to_json();
  const latest_version = changelog[0];

  return is_unreleased_version(latest_version);
}

/**
 * Creates a GitHub Release for the last [Unreleased] version in
 * the CHANGELOG.md file
 */
export async function create_github_release() {
  const changelog = await changelog_to_json();
  const latest_version = changelog[0];
  const version = latest_version.metadata.version;

  const release_metadata = {
    name: `Release v${version}`,
    tag_name: version,
    body: compose_release_changelog(latest_version),
    draft: false,
  };

  await octokit.rest.repos.createRelease({
    ...repository,
    ...release_metadata,
  });

  return version;
}

/**
 * Determines the commit message layout
 */
function get_commit_message(version: string) {
  const commit_message_re = /\{version\}/gi;
  const commit_message = core.getInput("message");

  return commit_message.replace(commit_message_re, version);
}

/**
 * Determines the default branch
 */
async function determine_default_branch() {
  const { data: metadata } = await octokit.rest.repos.get({
    ...repository,
  });

  return metadata.default_branch;
}

/**
 * Releases the latest GitHub release to the main branch
 */
export async function release_changelog() {
  await exec.getExecOutput("python3", ["-m", "changelogmanager", "release"], {
    silent: true,
  });
  const changelog = await changelog_to_json();
  const version = changelog[0].metadata.version;
  const default_branch = await determine_default_branch();
  const commit_message = get_commit_message(version);

  const updated_content = fs.readFileSync("CHANGELOG.md", {
    encoding: "utf8",
    flag: "r",
  });
  let request = {
    ...repository,
    path: "CHANGELOG.md",
    message: commit_message,
    content: Buffer.from(updated_content, "utf8").toString("base64"),
    branch: default_branch,
  };

  try {
    const { data: changelog } = await octokit.rest.repos.getContent({
      ...repository,
      path: "CHANGELOG.md",
    });
    request["sha"] = changelog.sha;
  } catch (error: any) {
    if (error.message !== "Not Found") {
      throw error;
    }
  }

  await octokit.rest.repos.createOrUpdateFileContents(request);
}
