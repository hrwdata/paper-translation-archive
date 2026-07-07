# Paper Translation Archive

`paper-translation-archive` is a static-first demo repository for aligned mathematical source artifacts, modern exposition, and Lean 4 formalizations.

The repository is organized around standalone artifact folders under `artifacts/`. Each artifact carries:

- source assets and provenance
- source, translation, and math segments
- region annotations and alignment IDs
- a self-contained Lean package
- generated static metadata used by the GitHub Pages site

## What this repo does

- builds a static site with an artifact index and artifact reader pages
- synchronizes source regions, translation segments, math segments, and Lean spans by stable alignment IDs
- validates artifact contracts locally
- compiles artifact Lean packages explicitly with `lake build`
- distinguishes static precomputed metadata from features that would require a live Lean service

## What this repo does not do in v1

- live Lean infoview or LSP-backed hover/definition lookup
- automatic OCR, HTR, or source-to-Lean alignment
- browser-side Lean editing
- runtime PDF or IIIF viewing in the default demo path

## Repo layout

- `artifacts/`: standalone artifact folders
- `lean-shared/`: shared Lean support package
- `schemas/`: JSON schemas for artifact data
- `scripts/`: validation and site-data build scripts
- `site/`: Vite + React frontend
- `docs/`: architecture, authoring, deployment, and metadata boundary docs

## Build and validation

```bash
npm install
npm run validate
npm run build
```

To validate Lean directly for the demo artifact:

```bash
cd artifacts/euclid-elements-i47/lean
lake --version
lake build
```

## GitHub Pages

This repo is designed for GitHub Pages via GitHub Actions. See `docs/github-pages.md`.
