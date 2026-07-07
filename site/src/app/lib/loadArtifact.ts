import type { ArtifactIndexItem, LoadedArtifact } from "../types";

function withBase(pathname: string) {
  return `${import.meta.env.BASE_URL}${pathname}`.replace(/([^:]\/)\/+/g, "$1");
}

export async function loadArtifactIndex(): Promise<ArtifactIndexItem[]> {
  const response = await fetch(withBase("site-data/artifacts-index.json"));
  if (!response.ok) {
    throw new Error(`Failed to load artifact index: ${response.status}`);
  }
  const payload = await response.json();
  return payload.items;
}

export async function loadArtifactBundle(artifactId: string): Promise<LoadedArtifact> {
  const bundlePath = withBase(`artifacts/${artifactId}/generated/artifact.bundle.json`);
  const response = await fetch(bundlePath);
  if (!response.ok) {
    throw new Error(`Failed to load artifact bundle for ${artifactId}: ${response.status}`);
  }
  const bundle = await response.json();
  return {
    bundle,
    assetBase: withBase(`artifacts/${artifactId}/`)
  };
}
