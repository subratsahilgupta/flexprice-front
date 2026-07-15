# Moyasar success/cancel redirect URLs — design

**Date:** 2026-07-15
**Status:** Approved

## Goal

Let users configure Moyasar's two redirect URLs from the connection UI:

- `success_url` — where the customer lands after a successful payment on Moyasar's hosted invoice page
- `cancel_url` — where the customer lands if they cancel or go back

Both are stored on the connection's flat, non-encrypted `metadata` map, which the
backend already reads when building the Moyasar invoice-sync request
(`ConnKeySuccessURL` / `ConnKeyCancelURL` in `internal/integration/moyasar/keys.go`).

Both are **optional and purely additive**. If unset, Moyasar simply doesn't redirect —
there is no fallback value to supply.

## Background: the metadata clobbering hazard

The backend's connection update handler does:

```go
// Update metadata if provided
if req.Metadata != nil {
    conn.Metadata = req.Metadata
}
```

Metadata is **replaced wholesale**, never merged key-by-key. Any `PUT` carrying a
`metadata` object silently drops every key absent from that object.

This makes the naive one-field-per-PUT approach actively destructive:

- Setting `success_url` alone would wipe an existing `cancel_url`.
- It would also wipe any *other* key the provider stores on the same map — the broader
  risk, since the two URLs are not necessarily the only inhabitants.

`PaddleConnectionDrawer.tsx:160` has this bug today:

```ts
metadata: trimmedRedirectUrl ? { redirect_url: trimmedRedirectUrl } : ({} as Record<string, string>)
```

The `{}` branch wipes the entire map. This is live, not hypothetical.

**Therefore: every metadata write is read-merge-write.** Read the current map via
`GET /connections/:id`, merge the fields being changed, `PUT` the full merged object.

`ZohoBooksConnectionDrawer.tsx:139` already establishes this pattern in-repo (for
`encrypted_secret_data` rather than `metadata`), so this follows existing convention.

## Design

### 1. Shared helper — `src/utils/common/connection_metadata_helpers.ts`

Extracted rather than inlined so the next provider cannot repeat the Paddle bug.

```ts
mergeConnectionMetadata(
  existing: Record<string, string> | undefined,
  updates: Record<string, string | undefined>,
): Record<string, string>
```

Semantics:

- Starts from a shallow copy of `existing` — unknown keys are preserved.
- A non-empty trimmed value in `updates` sets the key.
- An empty/whitespace/`undefined` value in `updates` **deletes** the key.

The delete-vs-empty-string distinction is load-bearing: `""` is a *value*, and would
hand Moyasar a blank redirect target instead of the "don't redirect" default.

Co-located `connection_metadata_helpers.test.ts` covers: preserving unknown keys,
setting, clearing via delete, trimming, and the empty-`existing` case.

### 2. `MoyasarConnectionDrawer.tsx`

- `MoyasarConnection` interface gains `metadata?: Record<string, string>`.
- `MoyasarFormData` gains `success_url` and `cancel_url`.
- Prefill both from `connection.metadata` in the existing `useEffect` reset.
- Both fields render in **create and edit** mode — they are editable settings, not
  write-once credentials. (The secret fields stay gated behind `!connection`.)
- Placement: after the publishable key, before the webhook block — matching where
  Paddle puts `redirect_url`.
- Validation: optional; if non-empty must match `/^https?:\/\/.+/`. Reuses the existing
  generically-worded `connection.validation.redirectUrlInvalid` key. No new validation strings.
- **Create:** include only non-empty keys; omit `metadata` entirely when both are blank.
- **Update:** `GET` the connection, `mergeConnectionMetadata`, `PUT` the full map.

### 3. `PaddleConnectionDrawer.tsx`

Same read-merge-write via the shared helper, fixing the `{}` clobber. Behavior otherwise
unchanged — this is a bug fix, not a redesign.

### 4. `src/models/Connection.ts`

Add `readonly metadata?: Record<string, string>` to the `Connection` interface.
`ConnectionApi.Get` returns `Connection`, so without this `existing.metadata` does not
typecheck; AGENTS.md bans `any`, so the field is declared rather than cast away.

### 5. i18n — `en` and `ar`

Six keys under `connection.moyasar`: `successUrl`, `successUrlPlaceholder`,
`successUrlHint`, `cancelUrl`, `cancelUrlPlaceholder`, `cancelUrlHint`.
Both locales, kept in sync per repo convention (`ar` already has full Moyasar coverage).

## Confirmed: metadata is returned on read

Both `GET /connections` (list) and `GET /connections/:id` (single) serialize `metadata`,
via the shared `ToConnectionResponse` / `ToConnectionResponses` converter which includes
`conn.Metadata` directly (`internal/api/dto/connection.go:450`).

So the full `success_url` / `cancel_url` map is available from either endpoint, and the
merge has real data to merge into.

### Why the save path still re-fetches

The `connection` prop already carries `metadata` (it comes from the list query in
`IntegrationDetails`), so a separate fetch is not needed for *correctness*. It is kept
for *staleness*:

- The list is fetched once on page mount.
- Merging into that mount-time copy loses any metadata written by another user, tab, or
  backend process since then — the same clobber this fix exists to prevent, with a wider
  race window rather than a guaranteed hit.
- Re-fetching at mutation time narrows the window from "however long the page sat open"
  to milliseconds.

The cost is one request on save of a rarely-touched settings form, and it matches the
existing Zoho / QuickBooks drawers.

Split accordingly:

- **Prefill on open** — use `connection.metadata` from the prop. No fetch. (Paddle does this.)
- **Merge on save** — `GET /connections/:id` for a fresh map, then merge and `PUT`.

## Out of scope

- Any change to how the backend consumes the URLs.
- Redirect URLs for providers other than Moyasar and Paddle.
- Broader refactoring of the connection drawers (there are ~11 with heavy duplication).
