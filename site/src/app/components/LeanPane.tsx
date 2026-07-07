import { useEffect, useMemo, useRef, useState } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useSelection } from "../state/selectionStore";
import type { ArtifactBundle } from "../types";
import { HoverPopover } from "./HoverPopover";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  }
};

type Props = {
  bundle: ArtifactBundle;
};

type RangeMap = {
  id: string;
  alignmentId: string;
  hoverKeys: string[];
  range: monaco.Range;
};

export function LeanPane({ bundle }: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [hoverKeys, setHoverKeys] = useState<string[]>([]);
  const decorationIdsRef = useRef<string[]>([]);
  const { activeAlignmentId, setHoveredAlignmentId, setSelectedAlignmentId } = useSelection();

  const primaryFile = bundle.lean.files[0];
  const rangeMaps = useMemo<RangeMap[]>(
    () =>
      bundle.lean.spans
        .filter((span) => span.file === primaryFile?.path)
        .map((span) => ({
          id: span.id,
          alignmentId: span.alignment_id,
          hoverKeys: span.hover_keys ?? [],
          range: new monaco.Range(span.start.line, span.start.column, span.end.line, span.end.column)
        })),
    [bundle.lean.spans, primaryFile?.path]
  );

  useEffect(() => {
    if (!shellRef.current || !primaryFile) {
      return;
    }

    const editor = monaco.editor.create(shellRef.current, {
      value: primaryFile.content,
      language: "plaintext",
      readOnly: true,
      minimap: { enabled: false },
      theme: "vs",
      fontFamily: "IBM Plex Mono, Cascadia Code, Consolas, monospace",
      fontSize: 14,
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      padding: { top: 16, bottom: 16 }
    });

    editorRef.current = editor;

    const mouseMove = editor.onMouseMove((event) => {
      if (!event.target.position) {
        setHoveredAlignmentId(null);
        return;
      }
      const match = rangeMaps.find((item) => item.range.containsPosition(event.target.position!));
      setHoveredAlignmentId(match?.alignmentId ?? null);
    });

    const mouseLeave = editor.onMouseLeave(() => {
      setHoveredAlignmentId(null);
    });

    const mouseDown = editor.onMouseDown((event) => {
      if (!event.target.position) {
        return;
      }
      const match = rangeMaps.find((item) => item.range.containsPosition(event.target.position!));
      if (!match) {
        return;
      }
      setSelectedAlignmentId(match.alignmentId);
      setHoverKeys(match.hoverKeys);
      editor.revealRangeInCenter(match.range);
    });

    return () => {
      mouseMove.dispose();
      mouseLeave.dispose();
      mouseDown.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, [primaryFile, rangeMaps, setHoveredAlignmentId, setSelectedAlignmentId]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const nextDecorations = rangeMaps.map((item) => ({
      range: item.range,
      options: {
        inlineClassName: item.alignmentId === activeAlignmentId ? "monaco-alignment-active" : "monaco-alignment",
        hoverMessage: { value: `Alignment: ${item.alignmentId}` }
      }
    }));

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, nextDecorations);

    const styleId = "monaco-alignment-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .monaco-alignment {
          background: rgba(138, 49, 26, 0.06);
          border-bottom: 1px dotted rgba(138, 49, 26, 0.24);
        }
        .monaco-alignment-active {
          background: rgba(138, 49, 26, 0.18);
          border-bottom: 1px solid rgba(138, 49, 26, 0.5);
        }
      `;
      document.head.appendChild(style);
    }

    const active = rangeMaps.find((item) => item.alignmentId === activeAlignmentId);
    if (active) {
      editor.revealRangeInCenterIfOutsideViewport(active.range);
      if (hoverKeys.length === 0 && active.hoverKeys.length > 0) {
        setHoverKeys(active.hoverKeys);
      }
    }
  }, [activeAlignmentId, hoverKeys.length, rangeMaps]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Lean Formalization</h3>
          <p className="panel-subtitle">Read-only code panel with static metadata popovers.</p>
        </div>
        <span className="status-chip mono">CI/static boundary: precomputed metadata only</span>
      </div>
      <div className="panel-body">
        <div className="lean-pane">
          <HoverPopover bundle={bundle} hoverKeys={hoverKeys} />
          <div className="segment-list">
            {rangeMaps.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`segment${item.alignmentId === activeAlignmentId ? " active" : ""}`}
                data-testid={`lean-span-${item.id}`}
                onClick={() => {
                  setSelectedAlignmentId(item.alignmentId);
                  setHoverKeys(item.hoverKeys);
                  editorRef.current?.revealRangeInCenter(item.range);
                }}
              >
                <span className="segment-kind">Lean span</span>
                <div className="mono">{item.id}</div>
              </button>
            ))}
          </div>
          <div className="monaco-shell" ref={shellRef} />
        </div>
      </div>
    </section>
  );
}
