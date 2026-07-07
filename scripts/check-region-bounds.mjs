import path from "node:path";
import {
  listArtifactDirs,
  readArtifact,
  readJson,
  readPngSize,
  repoRoot,
  resolveArtifactPath
} from "./lib.mjs";

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  const regions = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.regions));
  const sourceImagePath = resolveArtifactPath(artifactDir, artifact.source.primary_asset);

  if (artifact.source.kind === "image" && sourceImagePath.endsWith(".png")) {
    const actualSize = await readPngSize(sourceImagePath);
    if (
      actualSize.width !== artifact.source.canonical_size.width ||
      actualSize.height !== artifact.source.canonical_size.height
    ) {
      throw new Error(
        `Canonical size mismatch for ${path.relative(repoRoot, sourceImagePath)}: expected ${artifact.source.canonical_size.width}x${artifact.source.canonical_size.height}, got ${actualSize.width}x${actualSize.height}`
      );
    }
  }

  if (
    regions.image.width !== artifact.source.canonical_size.width ||
    regions.image.height !== artifact.source.canonical_size.height
  ) {
    throw new Error(`Region image size does not match artifact canonical size in ${artifact.id}`);
  }

  if (regions.regions.length < artifact.validation.min_region_count) {
    throw new Error(`Artifact ${artifact.id} has fewer than ${artifact.validation.min_region_count} regions`);
  }

  for (const region of regions.regions) {
    const inBounds =
      region.x >= 0 &&
      region.y >= 0 &&
      region.width > 0 &&
      region.height > 0 &&
      region.x + region.width <= 1 &&
      region.y + region.height <= 1;
    if (!inBounds) {
      throw new Error(`Region ${region.id} is out of bounds in ${artifact.id}`);
    }
  }
}

console.log("Region bounds checks passed.");
