# backend/neo4j

This library provides a simple `Neo4jModule` and `Neo4jService` which initialize the `neo4j-driver` using environment variables:

- `NEO4J_URI` (default: `bolt://localhost:7687`)
- `NEO4J_USER` (default: `neo4j`)
- `NEO4J_PASSWORD` (no default)

Usage: import `Neo4jModule` into your backend `AppModule` (or rely on it being global).
