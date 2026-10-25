# Installation and first scan

Start SADE with Docker and connect the evidence you already have. You do not need logs, specifications and code together to begin.

## Prerequisites

- Docker and Docker Compose
- Current source from the [SADE repository](https://github.com/BoB-15th-SADE/SADE)
- At least one OpenAPI 3.x JSON file, readable GitHub repository or HTTP log source

## 1. Start SADE

Run this from the SADE repository root, not from this SADE-docs repository.

```bash
docker compose up -d --build
```

Open [http://localhost:8765](http://localhost:8765). The default configuration binds locally and starts the API server, a heavy worker and a light reclassification worker.

## 2. Register available evidence

| Evidence | Open | Next step |
|---|---|---|
| OpenAPI JSON | Connect → Specifications → Add service | Register the service and specification to inspect declared APIs. |
| GitHub repository | Connect → Source Code | Connect a token, select repositories and choose Scan selected. |
| Splunk / WebHDFS logs | Connect → Log Sources | Configure connection, collection range and service assignment. |

Specifications are optional. Start with traffic alone or register a specification before connecting logs.

## 3. Check your log connection

1. Choose **Connect** on the Splunk or Cloudera integration.
2. Enter connection, authentication and collection settings.
3. Run **Test connection** to check access.
4. Review automatic field mapping; use Manual if necessary.
5. Choose **Save**. Saving configuration does not establish successful collection.

## 4. Run analysis

**Run scan** collects logs and builds the inventory, sensitive-data results, specification checks and flows. Sync checks collection separately and is not a required first step.

Registering specifications or code, or changing rules, also queues sensitive-field reclassification from saved evidence. That task does not fetch new logs, create a log scan or rerun policy checks.

## 5. Review results

- **Inventory**: API list with Spec / Code / Log sources
- **Sensitive Data**: types, request/response APIs and detection evidence
- **Call History**: retained recent calls and request/response structure
- **Findings**: Pass / Fail / Not evaluated specification checks
- **Flows**: observed calls and code/configuration relationships

## Stop or develop locally

```bash
docker compose down
```

Production Compose mounts data, imports and certificates; application code is built into the image. For source changes during development, use:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d --build
```

See [troubleshooting](../troubleshooting/index.md) for queued jobs, or [architecture and workers](../operations/architecture.md) to run without Docker.
