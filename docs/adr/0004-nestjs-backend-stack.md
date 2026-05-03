# NestJS backend stack

We chose NestJS (with TypeScript strict mode) over plain Express or Fastify. NestJS's module system, dependency injection, and decorator-based guards/pipes provide the structure needed for a multi-feature app (auth, predictions, scoring, admin) without hand-rolling conventions. The NestJS ecosystem also has first-class packages for everything we need: Passport, JWT, config, scheduling, and testing.

Express was rejected for requiring too much convention-from-scratch at this feature surface. Fastify is a viable alternative but adds no meaningful benefit over NestJS at this scale.
