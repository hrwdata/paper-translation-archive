import type { ArtifactBundle } from "../types";

type Props = {
  bundle: ArtifactBundle;
  hoverKeys: string[];
};

export function HoverPopover({ bundle, hoverKeys }: Props) {
  const entries = hoverKeys
    .map((key) => bundle.metadata.hover.entries.find((entry) => entry.key === key))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="hover-card" data-testid="hover-popover">
      <h4>Static Lean metadata</h4>
      {entries.map((entry) => (
        <div key={entry.key} style={{ marginTop: "12px" }}>
          <div className="mono">{entry.name}</div>
          <div>{entry.summary}</div>
          {entry.detail ? <div className="hover-note">{entry.detail}</div> : null}
        </div>
      ))}
      <div className="hover-note">
        Precomputed only. This panel does not query a live Lean server.
      </div>
    </div>
  );
}
