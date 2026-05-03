# Prisma over TypeORM

The NestJS documentation defaults to TypeORM, but we chose Prisma. The schema-first workflow generates fully-typed client code automatically, which matters here because Predictions have conditional fields (ET, penalty winner) that vary by Stage type. TypeORM's decorator-based approach requires manual interface maintenance and its migration tooling has known reliability issues. The lock-in cost of swapping ORMs is high enough to justify the upfront decision.

## Considered Options

- **TypeORM**: NestJS-native, decorator-based. Weaker generated types, unreliable migrations.
- **Prisma**: schema-first, excellent TypeScript output. Slightly less "NestJS-native" but widely used with it.
