import path from "node:path";
import { artifactsRoot, copyDir, ensureDir, removeDir } from "./lib.mjs";

const destArtifactsDir = path.join("site", "public", "artifacts");

await removeDir(destArtifactsDir);
await ensureDir(destArtifactsDir);
await copyDir(
  artifactsRoot,
  destArtifactsDir,
  (sourcePath, entry) => entry.isDirectory() && entry.name === ".lake"
);

console.log("Staged artifact assets into site/public/artifacts.");
