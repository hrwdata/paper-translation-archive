# Repo Architecture

The repository has two primary concerns:

1. artifact storage and validation
2. static site generation and delivery

Each artifact is self-contained under `artifacts/<artifact-id>/`. The site never discovers artifacts by crawling display text. It reads explicit manifests and alignment IDs.

## Runtime boundary

- static runtime data:
  - `generated/artifact.bundle.json`
  - `generated/lean-hover.json`
  - `generated/lean-deps.json`
  - `generated/lean-tactic-states.json`
- CI/local validation:
  - `lake build`
  - schema validation
  - snippet synchronization checks
- future backend-only features:
  - live Lean hover
  - live tactic state at arbitrary cursor positions
  - live go-to-definition against a Lean server

## Frontend boundary

- `site/index.html`: artifact listing
- `site/artifact.html?id=<artifact-id>`: three-pane reader
- `site/src/app/state/selectionStore.ts`: stable selection state keyed by alignment ID

## Lean boundary

Each artifact owns its own Lean package. Shared Lean helpers live in `lean-shared/` and are consumed through a local Lake path dependency.
