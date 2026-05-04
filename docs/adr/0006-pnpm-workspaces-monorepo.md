# pnpm workspaces monorepo

Backend and frontend live in the same repository under `apps/`, with shared TypeScript types in `packages/types`. A monorepo ensures API contract changes (types) are caught at compile time across both apps — a split-repo approach would rely on manual version bumps or copy-paste to stay in sync.

pnpm was chosen over npm workspaces for stricter dependency isolation (phantom dependencies are blocked by default) and significantly faster installs via content-addressable storage. This is the first time pnpm is used in this project; the trade-off is a mild learning curve against better long-term DX.
