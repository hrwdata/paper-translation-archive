import { useEffect, useMemo, useState } from "react";
import { loadArtifactIndex } from "./lib/loadArtifact";
import type { ArtifactIndexItem } from "./types";

export function ArtifactIndexPage() {
  const [items, setItems] = useState<ArtifactIndexItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadArtifactIndex()
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return items.filter((item) =>
      [item.id, item.slug, item.title, ...item.keywords].some((part) => part.toLowerCase().includes(lower))
    );
  }, [items, query]);

  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <p className="eyebrow">Static demo repository</p>
          <h1 className="page-title">Aligned Artifact Reader</h1>
          <p className="lede">
            A GitHub Pages-ready reader for source artifacts, modern exposition, and Lean 4 code aligned by stable IDs.
          </p>
        </div>
        <input
          className="search"
          aria-label="Search artifacts"
          placeholder="Search artifacts, titles, or keywords"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <div className="error-panel">{error}</div> : null}

      <section className="artifact-grid">
        {filtered.map((item) => (
          <a
            key={item.id}
            href={`${import.meta.env.BASE_URL}artifact.html?id=${encodeURIComponent(item.id)}`}
            className="artifact-card"
          >
            <p className="eyebrow">Artifact</p>
            <h2>{item.title}</h2>
            <p>Standalone folder with source assets, annotation data, generated metadata, and Lean package files.</p>
            <div className="artifact-meta">
              <span className="mono">{item.id}</span>
              <span>{item.keywords[0]}</span>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
