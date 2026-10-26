# Install and first connection

Run SADE with Docker and connect one log to see your first results. Specs and code can come later.

## You need

- [ ] Docker Engine with Compose, or Docker Desktop (the image is `linux/amd64`)
- [ ] A GitHub token with `read:packages` to pull the image from GHCR
- [ ] A log to connect: Splunk address, token and index, a Cloudera address, or a JSON log file

## 1. Install

<div class="sade-steps" markdown>

1. **Log in to GHCR.** The image is private, so this is needed once.

    ```bash
    docker login ghcr.io -u <GitHub username>
    ```

2. **Create an install folder.**

    ```bash
    mkdir sade && cd sade
    mkdir -p data imports certs
    ```

3. **Save `docker-compose.yml`.** It is the same file as `deploy/docker-compose.yml` in the SADE repository.

    ??? example "docker-compose.yml"

        ```yaml
        name: sade

        x-sade: &sade
          image: ${SADE_IMAGE:-ghcr.io/bob-15th-sade/sade:refactor-project-structure}
          working_dir: /workspace/apps/dashboard/backend
          environment:
            PYTHONUNBUFFERED: "1"
            SADE_PROJECT_ROOT: /workspace
          volumes:
            - "${SADE_DATA_DIR:-./data}:/workspace/apps/dashboard/data"
            - ./imports:/workspace/imports:ro
            - ./certs:/workspace/certs:ro
          restart: unless-stopped

        services:
          api:
            <<: *sade
            command: ["python", "api_server.py", "--host", "0.0.0.0", "--port", "8765"]
            ports:
              - "127.0.0.1:8765:8765"
          worker:
            <<: *sade
            command: ["python", "-m", "sade_cli", "worker", "--lane", "heavy"]
          worker-light:
            <<: *sade
            command: ["python", "-m", "sade_cli", "worker", "--lane", "light"]
        ```

4. **Start it.**

    ```bash
    docker compose up -d
    ```

5. Open <http://localhost:8765> in a browser. The port is open only on this machine (`127.0.0.1`).

</div>

| Folder | Use |
|---|---|
| `data/` | The SADE database (`sade.db`): connections, collections, results |
| `imports/` | Log files (mounted read-only) |
| `certs/` | Internal CA certificates (mounted read-only) |

## 2. Connect a log

Pick the tab for the log you have.

=== "Splunk"

    1. **Connect › Log Sources › Splunk › Connect**
    2. Enter Search API URL, Index and Authentication token.
    3. **Test connection** → **Save connection** → **Collect now**

    More: [Splunk](../connect/splunk.md)

=== "Cloudera"

    1. **Connect › Log Sources › Cloudera › Connect**
    2. Enter WebHDFS URL, authentication and DataNode addresses, then pick a folder with **Browse folders**.
    3. **Test connection** → **Save connection** → **Collect now**

    More: [Cloudera](../connect/cloudera.md)

=== "Log file"

    1. Put the file in `imports/`.
    2. Under Files in **Connect › Log Sources**, choose Access log and enter `/workspace/imports/your-file.jsonl`.
    3. **Save connection** → **Collect now**

    More: [Log files and OpenTelemetry](../connect/files.md)

To see in advance whether SADE can read your log, paste one line into the [log checker](../connect/logs.md#log-check).

## 3. See results

When collection finishes, these screens fill in.

| Screen | Shows |
|---|---|
| **APIs › Inventory** | APIs per service, call counts, auth methods |
| **APIs › Sensitive Data** | APIs per sensitive data type |
| **APIs › Call History** | Recent calls and request/response structure |
| **Flows** | A map linking callers, gateways, servers and databases |

## 4. Add more

| Add | You get | Guide |
|---|---|---|
| OpenAPI specs | Shadow APIs, per-call spec check | [OpenAPI specs](../connect/specs.md) |
| GitHub repositories | Specs from code, service calls, database access | [GitHub code scan](../connect/code.md) |
| Access and app logs, OTel spans | The full path of one request | [Log files and OpenTelemetry](../connect/files.md) |

After uploading a spec, run the spec check with **Run scan**. Logs are not fetched again.

## Admin commands

| Task | Command |
|---|---|
| Status | `docker compose ps` |
| Logs | `docker compose logs --tail 100 api worker worker-light` |
| Update | `docker compose pull && docker compose up -d` |
| Stop (keeps data) | `docker compose down` |
| Pin a version | `SADE_IMAGE=ghcr.io/bob-15th-sade/sade:sha-<commit> docker compose up -d` |

!!! warning "Do not expose it to the internet directly"
    The dashboard has no login of its own. For remote use, go through an SSH tunnel (`ssh -L 8765:127.0.0.1:8765 USER@HOST`) or your company's authenticating proxy.
