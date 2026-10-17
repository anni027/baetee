import { spawnSync } from "node:child_process";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");

const result = spawnSync("next", [command, ...args], { stdio: "inherit" });
process.exit(result.status ?? 1);
