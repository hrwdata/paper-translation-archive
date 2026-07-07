import { useMemo } from "react";
import { supportsImageSource } from "../lib/sourceAdapters/imageAdapter";
import { useSelection } from "../state/selectionStore";
import type { ArtifactBundle } from "../types";

type Props = {
  bundle: ArtifactBundle;
  assetBase: string;
  regionToAlignment: Map<string, string>;
};

export function ArtifactViewer({ bundle, assetBase, regionToAlignment }: Props) {
  const { activeAlignmentId, setHoveredAlignmentId, setSelectedAlignmentId } = useSelection();
  const imageUrl = useMemo(() => `${assetBase}${bundle.source.primary_asset}`, [assetBase, bundle.source.primary_asset]);

  if (!supportsImageSource(bundle.source.kind)) {
    return (
      <div className="error-panel">
        This demo runtime only renders image-backed sources directly. PDF and IIIF adapters are scaffolded but deferred.
      </div>
    );
  }

  return (
    <div className="artifact-viewer">
      <div className="figure-frame">
        <img
          className="figure-image"
          src={imageUrl}
          alt={`${bundle.title} source page`}
        />
        {bundle.regions.regions.map((region) => {
          const alignmentId = regionToAlignment.get(region.id) ?? null;
          const isActive = alignmentId !== null && alignmentId === activeAlignmentId;
          return (
            <button
              key={region.id}
              type="button"
              className={`region-box${isActive ? " active" : ""}`}
              data-testid={`region-${region.id}`}
              style={{
                left: `${region.x * 100}%`,
                top: `${region.y * 100}%`,
                width: `${region.width * 100}%`,
                height: `${region.height * 100}%`
              }}
              aria-label={region.label}
              onMouseEnter={() => setHoveredAlignmentId(alignmentId)}
              onMouseLeave={() => setHoveredAlignmentId(null)}
              onClick={() => setSelectedAlignmentId(alignmentId)}
            />
          );
        })}
      </div>
      <div className="metadata-grid">
        <div className="metadata-card">
          <h4>Artifact provenance</h4>
          <p>{bundle.source.provenance?.citation}</p>
        </div>
        <div className="metadata-card">
          <h4>Rights</h4>
          <p>{bundle.source.rights?.label}</p>
          <p className="hover-note">{bundle.source.rights?.details}</p>
        </div>
      </div>
    </div>
  );
}

