import { useEffect, useRef } from "react";
import { typesetMath } from "../lib/mathjax";
import { useSelection } from "../state/selectionStore";
import type { TextSegment } from "../types";

type Props = {
  segments: TextSegment[];
  anchorToAlignment: Map<string, string>;
};

export function MathPane({ segments, anchorToAlignment }: Props) {
  const { activeAlignmentId, setHoveredAlignmentId, setSelectedAlignmentId } = useSelection();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void typesetMath(containerRef.current);
  }, [segments, activeAlignmentId]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Math Layer</h3>
          <p className="panel-subtitle">MathJax-rendered notation synchronized by alignment ID.</p>
        </div>
      </div>
      <div className="panel-body" ref={containerRef}>
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
                {segment.latex ? <div className="math-latex">{`\\(${segment.latex}\\)`}</div> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
