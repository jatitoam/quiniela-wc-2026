# Vercel + Railway deployment

Frontend static files deploy to Vercel; the NestJS backend and PostgreSQL database deploy to Railway. Both platforms deploy from git with zero manual server configuration.

A self-managed VPS was rejected — the ops overhead (Docker setup, SSL, backups, monitoring) is not justified for an internal company pool. Railway was chosen over Render because it co-locates the NestJS app and its Postgres instance in the same project with shared environment variables, simplifying the `DATABASE_URL` wiring.
