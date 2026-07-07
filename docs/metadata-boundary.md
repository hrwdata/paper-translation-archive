# Metadata Boundary

The site displays three classes of information:

## Static source data

- source assets
- segment text
- region coordinates
- alignment membership

## Static generated data

- artifact bundle
- precomputed hover cards
- precomputed dependency metadata
- selected tactic-state snapshots
- snippet digests

Generated files must state:

- generation mode
- toolchain or source version
- generation timestamp
- whether live server support is required

## Not provided by v1

- live Lean elaboration
- live cursor-sensitive tactic state
- LSP-backed jump-to-definition
- on-demand imported declaration expansion
