# Data types and rules

Manage the 19 built-in types and custom types in **Policy → Rules → Data Types**. Field matching starts with an editable alias dictionary; explicit paths and value patterns add conditions.

## Quick edit

1. Select a type to open its panel.
2. Choose **Edit** on a rule or **Add rule**.
3. Enter field names, a path or a value pattern.
4. Put synthetic JSON in **Test sample** and choose **Test**.
5. **Save** stores a version and queues sensitive-field reclassification from saved evidence.

## Match methods

| Match by | Configuration | Use |
|---|---|---|
| Built-in detection | Default aliases/profile and optional extra value condition | Refine a built-in type |
| Field name | Field aliases | Add an organization-specific name such as `member_mail` |
| Field path | Explicit path | Assign meaning to `$.customer.contact` |
| Value pattern | Regular expression matched against the complete value | Custom formats such as `EMP-[0-9]{6}` |

Field names are normalized aliases, not a field-name regex editor. Additional built-in value conditions narrow the accepted values without bypassing structural/checksum failures. User regex syntax and length are restricted.

## Global rules and Scope

The default **All APIs / Request and response** scope applies changes to every API using that rule. A rule restricted to an API or location affects only that scope. Expand Scope before saving to confirm the intended range.

The light worker reclassifies **saved specifications, code and log evidence** after saving. It does not query remote systems or overwrite historical scans. Missing evidence or an insufficient cache can leave value checks unconfirmed; run a new log scan when required.

## Delete, disable and reset

| Item | Available actions |
|---|---|
| Built-in rule | Edit, Disable / Enable, Reset if modified |
| Custom rule | Edit, Disable / Enable, Delete |
| Built-in type | Disable / Enable the type |
| Custom type | Edit label/category; delete the type and current rules/exclusions |
| Saved version | Inspect History and Restore |

Built-in rules are not deleted like custom rules. Deleting a custom item leaves previously saved versions available in History.

## Exclude false positives

Use **Exclusions → Add exclusion** in the type panel and set API, location, field path, reason and expiry. Exclusions affect only the specified type and scope. Distinguish a global naming change from an exception for one API field.

Test runs the shared classifier on samples up to 32 KiB without storing the sample. Synthetic values make test results easier to share.
