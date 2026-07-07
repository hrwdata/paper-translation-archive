import { useSelection } from "../state/selectionStore";
import type { TextSegment } from "../types";

type Props = {
  title: string;
  subtitle: string;
  segments: TextSegment[];
  anchorToAlignment: Map<string, string>;
};

export function TranslationPane({ title, subtitle, segments, anchorToAlignment }: Props) {
  const { activeAlignmentId, setHoveredAlignmentId, setSelectedAlignmentId } = useSelection();

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">{title}</h3>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="panel-body">
        <div className="segment-list">
          {segments.map((segment) => {
            const alignmentId = anchorToAlignment.get(segment.id) ?? null;
            const isActive = alignmentId !== null && alignmentId === activeAlignmentId;
            return (
              <article
                key={segment.id}
                className={`segment${isActive ? " active" : ""}`}
                data-testid={`segment-${segment.id}`}
                onMouseEnter={() => setHoveredAlignmentId(alignmentId)}
                onMouseLeave={() => setHoveredAlignmentId(null)}
                onClick={() => setSelectedAlignmentId(alignmentId)}
              >
                <span className="segment-kind">{segment.kind}</span>
                <div>{segment.text}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
