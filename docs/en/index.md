# SADE documentation

SADE connects **logs, OpenAPI specifications and source code** into one API inventory. See which APIs are declared, which are called, and which sensitive fields they handle, with the source of each finding.

This guide follows the current project's installation, connection, analysis and rule-management workflow. Menu names match the English dashboard and remain recognizable when switching the dashboard language.

<div class="sade-links" markdown>

[**Get started**<span>Install SADE, connect logs and run your first scan.</span>](getting-started/quickstart.md)

[**Connect your data**<span>Connect Splunk, WebHDFS, specifications and GitHub.</span>](connect/logs.md)

[**Inspect sensitive data**<span>Read the 19 built-in types and their field and value evidence.</span>](features/sensitive-data.md)

[**Manage detection rules**<span>Edit aliases, paths and value patterns, then reclassify.</span>](policy/data-types.md)

</div>

## Three complementary sources

| Source | What it tells you | How to read it |
|---|---|---|
| Spec | APIs and fields declared in uploaded specifications | A declaration is not a runtime observation. |
| Code | APIs, fields and HTTP calls found in scanned code | Static code does not prove execution. |
| Log | Requests and responses recorded in the collection window | Missing bodies and calls outside that window remain unknown. |

A specification alone can populate APIs and sensitive-field candidates. Logs add observed traffic and contract differences. Code adds implementation evidence and declared HTTP calls between services.

## Your first workflow

1. Register available specifications, code or logs under **Connect**.
2. Choose **Run scan** to analyze traffic. It includes collection; a separate Sync is optional.
3. Review **APIs → Inventory / Call History / Sensitive Data**.
4. Open **Flows** for source-specific service relationships.
5. Manage data types and access scope under **Policy → Rules**, and inspect **Findings**.

SADE is currently a PoC tool. Sensitive-data evidence, access-scope labels and specification differences are separate results; they do not establish a legal violation or successful authentication. Read [supported scope and limits](reference/limitations.md).
