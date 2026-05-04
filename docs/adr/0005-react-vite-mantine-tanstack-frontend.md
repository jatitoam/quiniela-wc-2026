# React + Vite + Mantine + TanStack frontend stack

We chose a Vite SPA over Next.js. There is no SEO requirement, no server-side rendering need, and the app is largely authenticated — a pure SPA is simpler to deploy (static files on Vercel) and avoids SSR complexity that adds no value here.

- **Mantine**: full-featured component library with a form utility (`@mantine/form`) that removes the need for a separate form library. Chosen over Chakra/shadcn for its opinionated defaults and built-in Mantine notifications.
- **TanStack Router**: file-based routing with full TypeScript type-safety for route params and search params. Chosen over React Router for its stronger TS integration, which matters for a typed monorepo.
- **TanStack Query**: server-state management and caching. Avoids prop-drilling API responses through the component tree.
- **TanStack Table**: headless table primitives. The leaderboard and prediction views both need sortable, filterable tables; this avoids a heavy data-grid dependency.
