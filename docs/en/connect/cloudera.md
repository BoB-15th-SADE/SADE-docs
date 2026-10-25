# Connecting Cloudera (WebHDFS)

SADE reads JSONL log files stored in HDFS through the WebHDFS REST API.

## Quick setup

1. Open **Connect → Log Sources → Cloudera → Connect**.
2. Enter the HTTPS WebHDFS URL, HDFS path, authentication and allowed DataNodes.
3. Review service assignment and field mapping.
4. Choose **Test connection**, then **Save**.
5. Use **Run scan** to verify actual file reads and analysis.

## What you need

| Item | Description |
|---|---|
| WebHDFS URL | HTTPS NameNode address reachable from the SADE server (`/webhdfs/v1` optional) |
| HDFS log path | One JSONL file, or a directory of files |
| Authentication | A delegation token, or the HDFS user name on an unsecured cluster |
| DataNode addresses | `host:port` list of DataNodes that file reads may be redirected to |
| CA certificate (optional) | When the cluster uses a company certificate |

## Settings

| Field | Required | Description |
|---|---|---|
| Name | Yes | Display name |
| WebHDFS URL | Yes | Starts with `https://` |
| HDFS log path | Yes | File or directory; directories are not searched recursively, up to 100 files |
| Authentication | Yes | Delegation token or Unsecured HDFS user |
| Delegation token / HDFS user | Yes | Depending on the authentication mode |
| DataNode addresses | Yes | HTTPS DataNodes allowed for file reads (up to 100) |
| CA certificate file | No | Path to a certificate inside the SADE project folder |

- File extensions read: `.jsonl`, `.ndjson`, `.json`, `.log`
- Each line must be one JSON event.
- Field mapping and service assignment work as described in [Connecting logs](logs.md).

## How it works

| Step | WebHDFS call | What it checks |
|---|---|---|
| Test connection | `GETFILESTATUS` | The path is accessible |
| Sync / collection stage of Run scan | `LISTSTATUS` (directories) + `OPEN` | Files can actually be read |

- A successful Test does not guarantee that files can be read; Sync or Run scan performs the actual read.
- When a read is redirected away from the NameNode, SADE follows it **only to addresses in DataNode addresses**.
  The token is never sent to servers outside that list.

!!! warning "No Kerberos"
    Kerberos (SPNEGO) login and token issuing or renewal are not supported. Enter a delegation token issued beforehand.

## Limits

- Up to 10 MB per connection per read.
- Read data is kept in memory only; after SADE restarts, run Sync again.
- Not yet verified against a real company Cloudera cluster; tested with a mock server only.

## Common errors

| Message | Cause and fix |
|---|---|
| `A WebHDFS delegation token is required.` | Delegation token mode without a token |
| `HDFS directory has over 100 log files.` | Choose a narrower directory |
| `DataNode entries must be host:port addresses` | Enter DataNodes as `host:port` |
| `TLS failed` | Company certificate. Set the CA certificate file |

## Reference

- Apache Hadoop docs: [WebHDFS REST API](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html)
