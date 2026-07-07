import path from "node:path";
import {
  isoNow,
  listArtifactDirs,
  rangeSlice,
  readArtifact,
  readJson,
  readText,
  resolveArtifactPath,
  sha256,
  writeJson
} from "./lib.mjs";

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  const sourceSegments = await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.source_segments));
  const translationSegments = await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.translation_segments));
  const mathSegments = await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.math_segments));
  const regions = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.regions));
  const alignments = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.alignments));
  const leanSpans = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.lean_spans));
  const hover = await readJson(resolveArtifactPath(artifactDir, artifact.generated.hover));
  const deps = await readJson(resolveArtifactPath(artifactDir, artifact.generated.deps));
  const tacticStates = await readJson(resolveArtifactPath(artifactDir, artifact.generated.tactic_states));

  const files = [];
  for (const relativeFile of artifact.lean.files) {
    const content = await readText(resolveArtifactPath(artifactDir, relativeFile));
    files.push({
      path: relativeFile,
      language: "lean",
      content
    });
  }

  const snippetSpans = [];
  for (const span of leanSpans.spans) {
    const content = await readText(resolveArtifactPath(artifactDir, span.file));
    const snippet = rangeSlice(content, span.start, span.end);
    snippetSpans.push({
      id: span.id,
      file: span.file,
      declaration: span.declaration,
      sha256: sha256(snippet),
      text: snippet
    });
  }

  await writeJson(resolveArtifactPath(artifactDir, "generated/snippet-check.json"), {
    generated_at: isoNow(),
    spans: snippetSpans.map(({ text, ...rest }) => rest)
  });

  await writeJson(resolveArtifactPath(artifactDir, artifact.generated.bundle), {
    id: artifact.id,
    slug: artifact.slug,
    title: artifact.title,
    summary: `Static demo artifact bundle for ${artifact.title}`,
    source: artifact.source,
    textLayers: {
      source: sourceSegments,
      translation: translationSegments,
      math: mathSegments
    },
    regions,
    alignments,
    lean: {
      packageDir: artifact.lean.package_dir,
      entryModules: artifact.lean.entry_modules,
      files,
      spans: leanSpans.spans,
      snippets: snippetSpans
    },
    metadata: {
      hover,
      deps,
      tacticStates
    },
    references: artifact.references,
    builtAt: isoNow(),
    repoRelativeDir: path.relative(process.cwd(), artifactDir).replace(/\\/g, "/")
  });
}

console.log("Generated Lean metadata and artifact bundles.");
