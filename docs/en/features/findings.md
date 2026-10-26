# Findings

**Policy › Findings** collects calls that break company policy rules. Differences from the spec are not shown here; they are marked on each call.

## What shows where

| Result | Where to look |
|---|---|
| API not in the spec (shadow API, SPEC-001) | The **Shadow** tab in Inventory |
| Undeclared response field, type difference, missing required field, success without credentials | **Spec check** in Call History and API details › Calls |
| Company policy violations | **Findings** |

!!! note "Findings in this version"
    Creating and evaluating company policy rules is the next step. There are no policy rules yet, so Findings is empty. Spec check results are on the screens in the table above.

## Spec check states

| State | Meaning |
|---|---|
| Pass | The compared calls met the condition |
| Fail | A difference was confirmed from comparable evidence |
| Not evaluated | No spec, no response schema or no collected body, or the spec is a draft built from traffic and is not an independent baseline |

## Review steps

<div class="sade-steps" markdown>

1. Upload a spec and run **Run scan**.
2. See APIs missing from the spec in the Shadow tab of Inventory.
3. In Call History, gather calls that differ from the spec with **Spec check › Any mismatch**.
4. Open a call and look at the offending lines.
5. If the spec is wrong, fix the spec; if service assignment or mapping is wrong, fix the connection. Then run Run scan again.

</div>

The spec check judges observed calls. It does not decide authorization policy, whether sharing personal data is lawful, or whether every API is safe.

[<span class="q">Curious?</span><span class="t">The rules behind the per-call spec check</span><span class="arrow">→</span>](../technology/spec-check.md){ .sade-curious }
