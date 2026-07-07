import path from "node:path";
import { ensureDir, isoNow, listArtifactDirs, readArtifact, writeJson } from "./lib.mjs";

const items = [];

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  items.push({
    id: artifact.id,
    slug: artifact.slug,
    title: artifact.title,
    keywords: [
      artifact.id,
      artifact.slug,
      artifact.title,
      artifact.source.page_label,
      "lean",
      "translation",
      "artifact"
    ]
  });
}

const siteDataDir = path.join("site", "public", "site-data");
await ensureDir(siteDataDir);

await writeJson(path.join(siteDataDir, "artifacts-index.json"), {
  generated_at: isoNow(),
  items
});

await writeJson(path.join(siteDataDir, "search-index.json"), {
  generated_at: isoNow(),
  items
});

console.log("Built search and artifact indexes.");
