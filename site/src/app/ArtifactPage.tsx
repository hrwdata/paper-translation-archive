import { useEffect, useMemo, useState } from "react";
import { ArtifactViewer } from "./components/ArtifactViewer";
import { LeanPane } from "./components/LeanPane";
import { MathPane } from "./components/MathPane";
import { TranslationPane } from "./components/TranslationPane";
import { loadArtifactBundle } from "./lib/loadArtifact";
import { buildSelectionGraph } from "./lib/selectionGraph";
import { SelectionProvider, useSelection } from "./state/selectionStore";
import type { LoadedArtifact } from "./types";

function ArtifactPageInner({ loaded }: { loaded: LoadedArtifact }) {
  const graph = useMemo(() => buildSelectionGraph(loaded.bundle), [loaded.bundle]);
  const { selectedAlignmentId, setSelectedAlignmentId } = useSelection();

  useEffect(() => {
    if (!selectedAlignmentId && loaded.bundle.alignments.alignments[0]) {
      setSelectedAlignmentId(loaded.bundle.alignments.alignments[0].id);
    }
  }, [loaded.bundle.alignments.alignments, selectedAlignmentId, setSelectedAlignmentId]);

  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <p className="eyebrow">Artifact reader</p>
          <h1 className="page-title">{loaded.bundle.title}</h1>
          <p className="lede">{loaded.bundle.summary}</p>
        </div>
        <div className="status-chip mono">bundle built {new Date(loaded.bundle.builtAt).toLocaleString()}</div>
      </div>

      <div className="reader-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Source Artifact</h3>
              <p className="panel-subtitle">{loaded.bundle.source.page_label}</p>
            </div>
          </div>
          <div className="panel-body">
            <ArtifactViewer
              bundle={loaded.bundle}
              assetBase={loaded.assetBase}
              regionToAlignment={graph.regionToAlignment}
            />
          </div>
        </section>

        <div className="center-stack">
          <TranslationPane
            title="Modern Exposition"
            subtitle="English explanation layer keyed by stable segment IDs."
            segments={loaded.bundle.textLayers.translation.segments}
            anchorToAlignment={graph.anchorToAlignment}
          />
          <MathPane
            segments={loaded.bundle.textLayers.math.segments}
            anchorToAlignment={graph.anchorToAlignment}
          />
        </div>

        <LeanPane bundle={loaded.bundle} />
      </div>
    </main>
  );
}

export function ArtifactPage() {
  const [loaded, setLoaded] = useState<LoadedArtifact | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const artifactId = params.get("id");

    if (!artifactId) {
      setError("Missing artifact id. Open artifact.html?id=<artifact-id>.");
      return;
    }

    void loadArtifactBundle(artifactId)
      .then(setLoaded)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <main className="page-shell">
        <div className="error-panel">{error}</div>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="page-shell">
        <div className="status-chip">Loading artifact bundle...</div>
      </main>
    );
  }

  return (
    <SelectionProvider>
      <ArtifactPageInner loaded={loaded} />
    </SelectionProvider>
  );
}
