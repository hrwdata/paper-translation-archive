import type { ArtifactBundle } from "../types";

export type SelectionGraph = {
  anchorToAlignment: Map<string, string>;
  alignmentToAnchors: Map<string, string[]>;
  regionToAlignment: Map<string, string>;
  leanSpanToAlignment: Map<string, string>;
};

export function buildSelectionGraph(bundle: ArtifactBundle): SelectionGraph {
  const anchorToAlignment = new Map<string, string>();
  const alignmentToAnchors = new Map<string, string[]>();
  const regionToAlignment = new Map<string, string>();
  const leanSpanToAlignment = new Map<string, string>();

  for (const alignment of bundle.alignments.alignments) {
    alignmentToAnchors.set(alignment.id, alignment.members);
    for (const member of alignment.members) {
      anchorToAlignment.set(member, alignment.id);
      if (member.startsWith("region.")) {
        regionToAlignment.set(member.replace(/^region\./, ""), alignment.id);
      }
      if (member.startsWith("lean.")) {
        leanSpanToAlignment.set(member, alignment.id);
      }
    }
  }

  return {
    anchorToAlignment,
    alignmentToAnchors,
    regionToAlignment,
    leanSpanToAlignment
  };
}
