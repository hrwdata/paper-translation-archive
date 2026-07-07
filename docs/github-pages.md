# GitHub Pages

## Required repository setting

Set:

- `Settings -> Pages -> Build and deployment -> Source: GitHub Actions`

## Build commands

```bash
npm ci
npm run validate
npm run build
```

## Base path

Set `VITE_BASE_PATH` based on hosting mode:

- user or org pages: `/`
- project pages: `/<repo>/`

The Vite config normalizes the value and uses it as `base`.
