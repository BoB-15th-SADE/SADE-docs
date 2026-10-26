# Cloudera (WebHDFS)

SADE reads JSON log files stored in HDFS through the WebHDFS REST API. Pick a folder and it reads every subfolder; later collections read only what was appended to each file.

## Before you start

- [ ] The SADE server can reach the NameNode's WebHDFS HTTPS address, such as `https://namenode.company.internal:9871`.
- [ ] You know the DataNode addresses (`host:port`) that actually serve file data.
- [ ] You have a delegation token, or, on an unsecured cluster, an HDFS user name with read access.
- [ ] Logs are text files with one JSON object per line (`.jsonl`, `.ndjson`, `.json`, `.log`). Compressed files are not read.
- [ ] (With internal certificates) The CA certificate file is in `certs/`.

!!! warning "No automatic Kerberos login"
    SADE does not do SPNEGO login or issue and renew tokens. Enter a delegation token you issued beforehand.

## Connect in SADE

<div class="sade-steps" markdown>

1. Open **Connect › Log Sources › Cloudera › Connect**.
2. Enter the **WebHDFS URL**. `/webhdfs/v1` is optional.
3. Under **Authentication**, choose Delegation token or Unsecured HDFS user and enter the value.
4. Under **DataNode addresses**, enter each DataNode `host:port` on its own line.
5. Click **Browse folders**, move to the log folder and click **Use this folder**. Only folders this account can read and enter are listed.
6. Check path access with **Test connection**, then click **Save connection**.
7. Read the files with **Collect now**.

</div>

!!! info "When Test connection succeeds"
    Test only checks that the path is reachable with `GETFILESTATUS`. Reading file content is confirmed by Collect now.

## How it works

| Step | WebHDFS calls | What it does |
|---|---|---|
| Browse folders | `GETFILESTATUS`, `LISTSTATUS_BATCH`, `CHECKACCESS` | Lists only folders you can read and enter. File content is not read |
| Test connection | `GETFILESTATUS` | Checks path access |
| Collect now | `LISTSTATUS_BATCH` (every page, subfolders included), `OPEN` | Reads files in 2 MB pieces |

- **Range**: The collection range is fixed once at run time and filtered by **event time inside the log**, not file modification time. Start is inclusive, end exclusive.
- **Resuming**: The last read position of each file is recorded. The next run reads only past it and skips unchanged files. A replaced or truncated file is read from the start as a new file.
- **Unfinished lines**: A last line without a newline, and lines dated after the range, wait for the next run.
- **Safe redirects**: When a read is redirected away from the NameNode, SADE follows **only addresses in DataNode addresses**. Tokens are never sent to servers outside that list.
- **No change on failure**: Bad JSON, lines without a usable time, or a file cut off mid-read leave the source's previous data and checkpoint untouched.

## Limits

| Item | Limit |
|---|---|
| Read size per request | 2 MB |
| Data read per collection | 256 MB |
| Folder and file entries explored | 100,000 |
| Request timeout | 90 seconds |

## Common errors

| Message | Cause | Fix |
|---|---|---|
| `A WebHDFS delegation token is required.` | Token mode with an empty token | Enter the token |
| `DataNode entries must be host:port addresses` | Address format | Enter like `dn1.company.internal:9865` |
| `Remote server returned HTTP 403` | No read permission on the folder | Check account permissions. An account that cannot read the root needs a start folder from the admin |
| `TLS failed` | Internal certificate | Set a CA certificate |
| `HDFS collection contains unreadable or unsupported records` | Unreadable lines or files | Check the file. Previous data and the checkpoint are kept |

## Notes

- Folder browsing and ranged collection were confirmed against a real Cloudera NameNode and DataNode over HTTPS with CA verification. Large production clusters need separate testing.
- Apache Hadoop documentation: [WebHDFS REST API](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html)

[<span class="q">Curious?</span><span class="t">How logs of any format become the same record</span><span class="arrow">→</span>](../technology/log-normalization.md){ .sade-curious }
