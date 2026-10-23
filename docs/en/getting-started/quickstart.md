# Quick start

Run the SADE dashboard with Docker and complete a first scan.

## Requirements

- Docker Desktop (with Docker Compose)
- Git

## 1. Get the code

!!! note
    The SADE code repository is currently private. Access is required to clone it.

```bash
git clone -b feat/dashboard-design https://github.com/BoB-15th-SADE/SADE.git
cd SADE
```

## 2. Run

```bash
docker compose up -d --build
```

- Dashboard: <http://localhost:8765> (reachable from this computer only)
- Containers
    - `api`: dashboard, API and job intake
    - `worker`: log collection and analysis
- Settings, specs and results are stored in `apps/sade-dashboard/data` and an SQLite database.

## 3. First scan

1. Upload an OpenAPI spec in **Connect > Specifications** to register a service.
2. Connect logs in **Connect > Log Sources** (see [Connect logs](../connect/logs.md)).
3. Click **Run scan** to start the analysis.
4. Review the results in **APIs > Inventory**.

## 4. Stop

```bash
docker compose down
```

!!! tip
    Planned: running a scan with sample data
