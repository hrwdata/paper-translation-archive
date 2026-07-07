import {
  listArtifactDirs,
  readArtifact,
  readJson,
  resolveArtifactPath
} from "./lib.mjs";

function assertUniqueIds(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} id: ${value}`);
    }
    seen.add(value);
  }
}

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  const regions = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.regions));
  const alignments = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.alignments));
  const sourceSegments = await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.source_segments));
  const translationSegments = await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.translation_segments));
  const mathSegments = await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.math_segments));
  const leanSpans = await readJson(resolveArtifactPath(artifactDir, artifact.annotations.lean_spans));
  const hoverData = await readJson(resolveArtifactPath(artifactDir, artifact.generated.hover));

  assertUniqueIds(regions.regions.map((item) => item.id), "region");
  assertUniqueIds(sourceSegments.segments.map((item) => item.id), "source segment");
  assertUniqueIds(translationSegments.segments.map((item) => item.id), "translation segment");
  assertUniqueIds(mathSegments.segments.map((item) => item.id), "math segment");
  assertUniqueIds(leanSpans.spans.map((item) => item.id), "lean span");
  assertUniqueIds(alignments.anchors.map((item) => item.id), "anchor");
  assertUniqueIds(alignments.alignments.map((item) => item.id), "alignment");

  const regionIds = new Set(regions.regions.map((item) => item.id));
  const sourceIds = new Set(sourceSegments.segments.map((item) => item.id));
  const translationIds = new Set(translationSegments.segments.map((item) => item.id));
  const mathIds = new Set(mathSegments.segments.map((item) => item.id));
  const leanSpanIds = new Set(leanSpans.spans.map((item) => item.id));
  const hoverKeys = new Set(hoverData.entries.map((item) => item.key));
  const anchorIds = new Set(alignments.anchors.map((item) => item.id));

  for (const anchor of alignments.anchors) {
    if (anchor.layer === "artifact_region" && !regionIds.has(anchor.target.region_id)) {
      throw new Error(`Unknown region_id ${anchor.target.region_id} in ${artifact.id}`);
    }
    if (anchor.layer === "source_span" && !sourceIds.has(anchor.target.segment_id)) {
      throw new Error(`Unknown source segment ${anchor.target.segment_id} in ${artifact.id}`);
    }
    if (anchor.layer === "translation_span" && !translationIds.has(anchor.target.segment_id)) {
      throw new Error(`Unknown translation segment ${anchor.target.segment_id} in ${artifact.id}`);
    }
    if (anchor.layer === "math_span" && !mathIds.has(anchor.target.segment_id)) {
      throw new Error(`Unknown math segment ${anchor.target.segment_id} in ${artifact.id}`);
    }
    if (anchor.layer === "lean_span" && !leanSpanIds.has(anchor.id)) {
      throw new Error(`Lean span anchor ${anchor.id} has no matching lean span record in ${artifact.id}`);
    }
    if (anchor.layer === "hover_metadata" && !hoverKeys.has(anchor.target.key)) {
      throw new Error(`Hover metadata key ${anchor.target.key} missing in ${artifact.id}`);
    }
  }

  for (const alignment of alignments.alignments) {
    for (const member of alignment.members) {
      if (!anchorIds.has(member)) {
        throw new Error(`Alignment ${alignment.id} references unknown anchor ${member} in ${artifact.id}`);
      }
    }
  }
}

console.log("Alignment integrity checks passed.");
