import {
  listArtifactDirs,
  rangeSlice,
  readArtifact,
  readJson,
  readText,
  resolveArtifactPath,
  sha256
} from "./lib.mjs";

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  if (!artifact.validation.require_snippet_sync) {
    continue;
  }

  const leanSpans = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.lean_spans));
  const snippetCheck = await readJson(resolveArtifactPath(artifactDir, "generated/snippet-check.json"));

  for (const span of leanSpans.spans) {
    const filePath = resolveArtifactPath(artifactDir, span.file);
    const content = await readText(filePath);
    const snippet = rangeSlice(content, span.start, span.end);
    const digest = sha256(snippet);
    const recorded = snippetCheck.spans.find((entry) => entry.id === span.id);
    if (!recorded) {
      throw new Error(`Missing snippet digest for ${span.id} in ${artifact.id}`);
    }
    if (recorded.sha256 !== digest) {
      throw new Error(`Stale snippet digest for ${span.id} in ${artifact.id}`);
    }
  }
}

console.log("Snippet synchronization checks passed.");
