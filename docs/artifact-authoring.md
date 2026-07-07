# Artifact Authoring

Every artifact folder must include:

- `artifact.yaml`
- source assets and source segments
- translation and math segments
- region annotations
- alignment graph
- Lean package
- generated metadata
- bibliography and README

## Authoring rules

- use stable IDs for every segment, region, and alignment anchor
- keep source coordinates attached to a canonical source asset
- keep displayed Lean snippets tied to exact file ranges in `annotations/lean-spans.json`
- record rights and provenance per artifact
- never rely on runtime text matching for alignment

## Minimal workflow

1. create `artifacts/<artifact-id>/`
2. add the source image and optional original PDF
3. write source, translation, and math segments
4. mark regions in `annotations/regions.json`
5. connect layers in `annotations/alignment.graph.json`
6. add Lean modules and span references
7. run `npm run build:site-data`
8. run `npm run validate`
