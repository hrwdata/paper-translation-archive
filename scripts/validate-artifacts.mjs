import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  listArtifactDirs,
  pathExists,
  readArtifact,
  readJson,
  repoRoot,
  resolveArtifactPath
} from "./lib.mjs";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaFiles = {
  artifact: "artifact.schema.json",
  textSegments: "text-segments.schema.json",
  regions: "region-annotations.schema.json",
  alignments: "alignment-graph.schema.json",
  hover: "lean-hover.schema.json",
  search: "search-index.schema.json"
};

async function loadSchema(fileName) {
  return JSON.parse(await fs.readFile(path.join(repoRoot, "schemas", fileName), "utf8"));
}

function fail(message) {
  throw new Error(message);
}

async function validateAgainst(name, data) {
  const schemaFile = schemaFiles[name];
  let validate = ajv.getSchema(schemaFile);
  if (!validate) {
    const schema = await loadSchema(schemaFile);
    validate = ajv.compile({ ...schema, $id: schemaFile });
  }
  const ok = validate(data);
  if (!ok) {
    fail(`${schemaFile} validation failed: ${ajv.errorsText(validate.errors, { separator: "\n" })}`);
  }
}

for (const artifactDir of await listArtifactDirs()) {
  const { artifact } = await readArtifact(artifactDir);
  await validateAgainst("artifact", artifact);

  const requiredFiles = [
    artifact.source.primary_asset,
    artifact.text_layers.source_segments,
    artifact.text_layers.translation_segments,
    artifact.text_layers.math_segments,
    artifact.annotations.regions,
    artifact.annotations.alignments,
    artifact.annotations.lean_spans,
    artifact.generated.bundle,
    artifact.generated.hover,
    artifact.generated.deps,
    artifact.generated.tactic_states,
    artifact.references.bibliography
  ];

  if (artifact.source.pdf_asset) {
    requiredFiles.push(artifact.source.pdf_asset);
  }

  for (const filePath of requiredFiles) {
    const absolutePath = resolveArtifactPath(artifactDir, filePath);
    if (!(await pathExists(absolutePath))) {
      fail(`Missing required artifact file: ${path.relative(repoRoot, absolutePath)}`);
    }
  }

  for (const leanFile of artifact.lean.files) {
    const absolutePath = resolveArtifactPath(artifactDir, leanFile);
    if (!(await pathExists(absolutePath))) {
      fail(`Missing Lean file: ${path.relative(repoRoot, absolutePath)}`);
    }
  }

  await validateAgainst("textSegments", await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.source_segments)));
  await validateAgainst("textSegments", await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.translation_segments)));
  await validateAgainst("textSegments", await readJson(resolveArtifactPath(artifactDir, artifact.text_layers.math_segments)));
  await validateAgainst("regions", await readJson(resolveArtifactPath(artifactDir, artifact.annotations.regions)));
  await validateAgainst("alignments", await readJson(resolveArtifactPath(artifactDir, artifact.annotations.alignments)));
  await validateAgainst("hover", await readJson(resolveArtifactPath(artifactDir, artifact.generated.hover)));
}

console.log("Artifact schema validation passed.");
