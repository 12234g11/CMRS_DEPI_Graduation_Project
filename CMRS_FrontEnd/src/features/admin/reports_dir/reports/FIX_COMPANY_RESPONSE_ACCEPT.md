# Fix: accept company solution

The endpoint is case-sensitive for the legacy `action` field.

The accept button now sends exactly:

```json
{
  "action": "Approve",
  "decision": "accept_solution"
}
```

The previous compatibility loop was removed so a single button click sends only
one POST request instead of trying multiple invalid lowercase action values.
