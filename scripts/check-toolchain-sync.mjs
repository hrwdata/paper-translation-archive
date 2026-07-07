import fs from "node:fs/promises";
import path from "node:path";
import { listArtifactDirs, readArtifact, repoRoot, resolveArtifactPath } from "./lib.mjs";

const expectedToolchain = (await fs.readFile(path.join(repoRoot, "lean-shared", "lean-toolchain"), "utf8")).trim();

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  const toolchain = (
    await fs.readFile(resolveArtifactPath(artifactDir, path.join(artifact.lean.package_dir, "lean-toolchain")), "utf8")
  ).trim();
  if (toolchain !== expectedToolchain) {
    throw new Error(`Toolchain mismatch for ${artifact.id}: expected ${expectedToolchain}, got ${toolchain}`);
  }
}

console.log("Toolchain sync checks passed.");
