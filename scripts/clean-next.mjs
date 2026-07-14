import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const nextDirectory = resolve(".next");

if (existsSync(nextDirectory)) {
  rmSync(nextDirectory, { recursive: true, force: true });
  console.log("Cleaned .next cache");
} else {
  console.log(".next cache not found, skipping clean");
}
