// Validate locally using the same framework build Vercel runs. The Vercel flag
// applies only to the build; local-relay unit tests still exercise local mode.
import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this check with npm run check:deploy.");
if (Number(process.versions.node.split(".")[0]) !== 24) {
  throw new Error("Use Node.js 24.x to match the Vercel deployment runtime.");
}
for (const script of ["type-check", "lint", "test", "build"]) {
  console.log(`\nDeployment check: ${script}`);
  const result = spawnSync(process.execPath, [npmCli, "run", script], {
    stdio: "inherit",
    env: { ...process.env, ...(script === "build" ? { VERCEL: "1" } : {}) },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("\nPASS: local Vercel deployment checks. No deployment was published.");
