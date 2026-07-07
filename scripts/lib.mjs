import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, "..");
export const artifactsRoot = path.join(repoRoot, "artifacts");

export function isoNow() {
  return new Date().toISOString();
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function readJson(targetPath) {
  return JSON.parse(await fs.readFile(targetPath, "utf8"));
}

export async function writeJson(targetPath, value) {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readYaml(targetPath) {
  return YAML.parse(await fs.readFile(targetPath, "utf8"));
}

export async function readText(targetPath) {
  return await fs.readFile(targetPath, "utf8");
}

export async function listArtifactDirs() {
  if (!(await pathExists(artifactsRoot))) {
    return [];
  }
  const entries = await fs.readdir(artifactsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(artifactsRoot, entry.name))
    .sort();
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function resolveArtifactPath(artifactDir, relativePath) {
  return path.resolve(artifactDir, relativePath);
}

export async function readArtifact(artifactDir) {
  const manifestPath = path.join(artifactDir, "artifact.yaml");
  const artifact = await readYaml(manifestPath);
  return {
    artifactDir,
    manifestPath,
    artifact
  };
}

export async function copyDir(sourceDir, destDir, shouldSkip = () => false) {
  await ensureDir(destDir);
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (shouldSkip(sourcePath, entry)) {
      continue;
    }
    if (entry.isDirectory()) {
      await copyDir(sourcePath, destPath, shouldSkip);
    } else {
      await ensureDir(path.dirname(destPath));
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

export async function removeDir(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

export async function readPngSize(targetPath) {
  const buffer = await fs.readFile(targetPath);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`Expected PNG signature in ${targetPath}`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

export function rangeSlice(content, start, end) {
  const lines = content.split("\n");
  const startLine = Math.max(start.line - 1, 0);
  const endLine = Math.max(end.line - 1, 0);
  if (startLine === endLine) {
    return (lines[startLine] ?? "").slice(start.column - 1, end.column - 1);
  }

  const parts = [];
  parts.push((lines[startLine] ?? "").slice(start.column - 1));
  for (let i = startLine + 1; i < endLine; i += 1) {
    parts.push(lines[i] ?? "");
  }
  parts.push((lines[endLine] ?? "").slice(0, end.column - 1));
  return parts.join("\n");
}
