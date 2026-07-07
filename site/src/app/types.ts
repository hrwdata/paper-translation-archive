export type TextSegment = {
  id: string;
  kind: string;
  text: string;
  latex?: string;
};

export type ArtifactBundle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source: {
    kind: "image" | "pdf-page" | "iiif-canvas";
    primary_asset: string;
    pdf_asset?: string;
    page_label?: string;
    canonical_size?: { width: number; height: number };
    provenance?: {
      citation: string;
      source_repository: string;
      source_institution: string;
    };
    rights?: {
      label: string;
      url: string;
      details: string;
    };
  };
  textLayers: {
    source: { document: string; segments: TextSegment[] };
    translation: { document: string; segments: TextSegment[] };
    math: { document: string; segments: TextSegment[] };
  };
  regions: {
    image: { width: number; height: number };
    regions: Array<{
      id: string;
      label: string;
      shape: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  };
  alignments: {
    version: 1;
    anchors: Array<{
      id: string;
      layer: string;
      target: Record<string, unknown>;
    }>;
    alignments: Array<{
      id: string;
      kind: string;
      members: string[];
      display_order: number;
      label: string;
    }>;
  };
  lean: {
    packageDir: string;
    entryModules: string[];
    files: Array<{
      path: string;
      language: string;
      content: string;
    }>;
    spans: Array<{
      id: string;
      alignment_id: string;
      file: string;
      start: { line: number; column: number };
      end: { line: number; column: number };
      declaration: string;
      hover_keys?: string[];
    }>;
    snippets: Array<{
      id: string;
      file: string;
      declaration: string;
      sha256: string;
      text: string;
    }>;
  };
  metadata: {
    hover: {
      provenance: {
        mode: string;
        toolchain: string;
        generated_at: string;
        live_server_required: boolean;
      };
      entries: Array<{
        key: string;
        name: string;
        kind: string;
        module?: string;
        summary: string;
        detail?: string;
      }>;
    };
    deps: {
      provenance?: Record<string, unknown>;
      declarations: Array<{
        name: string;
        depends_on: string[];
      }>;
    };
    tacticStates: {
      provenance?: Record<string, unknown>;
      states: Array<{
        alignment_id: string;
        label: string;
        goal: string;
      }>;
    };
  };
  references: {
    bibliography: string;
  };
  builtAt: string;
  repoRelativeDir: string;
};

export type ArtifactIndexItem = {
  id: string;
  slug: string;
  title: string;
  keywords: string[];
};

export type LoadedArtifact = {
  bundle: ArtifactBundle;
  assetBase: string;
};

