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
 * Creates a new DRAFT release based on the [Unreleased] tag in the
 * CHANGELOG.md file
 */
export async function create_draft_release() {
  await exec.getExecOutput(
    "python3",
    [
      "-m",
      "changelogmanager",
      "github-release",
      "--github-token",
      github_token,
      "--repository",
      `${repository.owner}/${repository.repo}`,
    ],
    {
      silent: true,
    }
  );
}

/**
 * Retrieves the latest GitHub release from the current repository
 *
 * @returns GitHub Release object
 */
async function get_latest_release() {
  try {
    return (
      await octokit.rest.repos.getLatestRelease({
        ...repository,
      })
    ).data;
  } catch (error: any) {
    if (error.message !== "Not Found") {
      throw error;
    }
    throw new Error("No Release found");
  }
}

/**
 *
 * @param source_branch
 * @param target_branch
 */
async function create_update_branch_if_needed(
  source_branch: string,
  target_branch: string
) {
  const { data: latest_commit } = await octokit.rest.repos.getBranch({
    ...repository,
    branch: source_branch,
  });

  await octokit.rest.git
    .createRef({
      ...repository,
      ref: `refs/heads/${target_branch}`,
      sha: latest_commit.commit.sha,
    })
    .catch((error) => {
      if (error.message === "Reference already exists") {
        return;
      }

      throw error;
    });
}

/**
 * Releases the latest GitHub release to the main branch
 */
export async function release_changelog() {
  try {
    var release = await get_latest_release();
  } catch (error: any) {
    throw error;
  }

  await exec.getExecOutput(
    "python3",
    [
      "-m",
      "changelogmanager",
      "release",
      "--override-version",
      release.tag_name,
    ],
    {
      silent: true,
    }
  );

  const target_branch = `docs/update-changelog-for-${release.tag_name}`;
  await create_update_branch_if_needed("master", target_branch);

  const updated_content = fs.readFileSync("CHANGELOG.md", {
    encoding: "utf8",
    flag: "r",
  });
  let request = {
    ...repository,
    path: "CHANGELOG.md",
    message: `docs(changelog): update CHANGELOG.md for ${release.tag_name}`,
    content: Buffer.from(updated_content, "utf8").toString("base64"),
    branch: target_branch,
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
