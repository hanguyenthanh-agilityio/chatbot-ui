import { execSync } from "node:child_process";
import { GITLAB_DEPLOY_IGNORE_PATHS } from "./gitlab-deploy-ignore-paths.mjs";

function quote(path) {
  return `"${path.replace(/"/g, '\\"')}"`;
}

function listTrackedDeployPaths() {
  const tracked = execSync("git ls-files -z", { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);

  return GITLAB_DEPLOY_IGNORE_PATHS.filter((path) => tracked.includes(path));
}

function hasStagedChanges() {
  return execSync("git diff --cached --name-only", { encoding: "utf8" }).trim()
    .length > 0;
}

/**
 * Remove Cloudflare deploy assets from the git index (files stay on disk).
 * @param {{ autoCommit?: boolean }} options
 * @returns {boolean} whether any paths were stripped
 */
export function stripDeployForGitLab({ autoCommit = false } = {}) {
  const paths = listTrackedDeployPaths();
  if (paths.length === 0) {
    return false;
  }

  execSync(`git rm --cached -f -- ${paths.map(quote).join(" ")}`, {
    stdio: "inherit",
  });

  if (autoCommit && hasStagedChanges()) {
    execSync(
      'git commit -m "chore: remove Cloudflare deploy assets for GitLab"',
      { stdio: "inherit" },
    );
  }

  return true;
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  stripDeployForGitLab({ autoCommit: process.argv.includes("--commit") });
}
