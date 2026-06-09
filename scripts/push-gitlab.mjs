import { execSync } from "node:child_process";
import { stripDeployForGitLab } from "./strip-deploy-for-gitlab.mjs";

const pushArgs = process.argv.slice(2);
const branch =
  pushArgs.find((arg) => !arg.startsWith("-")) ??
  execSync("git branch --show-current", { encoding: "utf8" }).trim();

stripDeployForGitLab({ autoCommit: true });

const remoteArgs = pushArgs.length > 0 ? pushArgs.join(" ") : branch;
execSync(`git push origin ${remoteArgs}`, { stdio: "inherit" });
