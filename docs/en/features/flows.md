# Service flows (Flows)

**Flows** draws your environment as a map: **Clients → Gateways → Hosts → Destinations**. At a glance you see who goes through which gateway to call services on which server, and which databases they reach. For the path of a single request, use [Request flow](call-history.md#request-flow).

## Reading the map

| Column | Meaning |
|---|---|
| **Clients** | Groups of observed callers, including unnamed internal callers, not only outside users |
| **Gateways** | Gateways decided from deployment data, names and routing rules |
| **Hosts** | Servers, VMs and Kubernetes nodes grouped by collected host data, with their services. Without host data, "Host not observed" |
| **Destinations** | Observed PostgreSQL databases and external hosts that code calls outside the scan |

Lines between the same two ends are merged, and lines inside one server are hidden. Click a line to see the API links and evidence inside it.

## Drilling down

<div class="sade-steps" markdown>

1. **Click Clients** to see callers grouped by entry API and downstream path. Two groups can share an entry API if their downstream paths differ.
2. **Click an IP in a group** to expand only that IP's request paths, service by service.
3. **Click a service under Hosts** to keep only the paths into that service and the work behind it.
4. Choose a **Trace** in the right panel to highlight only that request's nodes and lines. **Request details** opens the request flow tree; **Environment** returns to the full map.

</div>

## LOG / SPEC / CODE

| Evidence | Nodes | Lines |
|---|---|---|
| **LOG** | APIs seen in logs and spans | Real calls, callers, span links, database access |
| **CODE** | APIs in code | HTTP calls in code (dotted), gateway routes (dashed) |
| **SPEC** | APIs in specs | None. A spec does not say who calls it |

The buttons only change the view; nothing is collected or scanned again. A code line means "can call"; check LOG to see whether it actually did.

## For an accurate map

| You have | You see |
|---|---|
| Gateway logs only | Caller → gateway → API |
| + service access and application logs | Service-to-service calls (by request ID) |
| + traces (`traceparent` or spans) | The most exact service-to-service calls |
| + host data (`host.name`, `k8s.node.name`) | Placement by server |
| + PostgreSQL spans | Database access |

## Limits

- The caller IP is the peer address (`client_ip`). The original client from X-Forwarded-For appears separately in Call History.
- Large Splunk sources show flows within their per-API samples.
- Addresses decided at runtime, HTTP libraries that are not read, and services that do not log can leave lines out.
- gRPC and message queues are not covered.

[<span class="q">Curious?</span><span class="t">How real calls are linked from logs and traces</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }

[<span class="q">Curious?</span><span class="t">How service calls and database access are found in code</span><span class="arrow">→</span>](../technology/code2flow.md){ .sade-curious }
