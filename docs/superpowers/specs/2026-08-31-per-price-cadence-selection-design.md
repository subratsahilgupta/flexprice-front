# Per-price cadence selection at subscription create

Date: 2026-08-31
Status: Design (part 1 shipped; part 2 blocked on backend)
Related backend: PR #2699 (mixed-cadence line items + `IsCadenceCompatible`)

## Context

Backend PR #2699 lets a single subscription hold line items with cadences
finer than the subscription's own. A quarterly subscription can now carry
monthly prices; each finer-cadence price fans out into N line items per
invoice (monthly on quarterly → 3 line items per invoice window, each
with its own `period_start` / `period_end`). The rule (backend
`types.IsCadenceCompatible`):

- ONETIME items are always compatible.
- Otherwise the item's effective months must evenly divide the
  subscription's effective months (`sub_months % item_months === 0`).
- DAILY / WEEKLY require exact period + count match.

At plan-attach time (`internal/ee/service/subscription.go:3949-3950`) the
backend auto-attaches every compatible price on the plan. There is
currently no way for the frontend to opt individual prices out at
subscription-create.

## Problem

Two problems arise on the frontend:

1. **Display drift (fixed in this PR).** Before #2699, the create-sub
   UI filtered plan prices with `p.billing_period === sub.billing_period`
   (plus ONETIME). After #2699 the backend attaches every *compatible*
   price. On a plan with a monthly + a quarterly price, creating a
   quarterly subscription hid the monthly price in the UI while the
   backend still billed it — invoice reality no longer matched what
   the user saw before submit.

2. **No opt-out UX (deferred).** Some customers want to decide, per
   price, whether it participates in a given subscription. Today it's
   all-or-nothing at the plan level.

## Part 1 — shipped in this PR

**Cadence-compat helper.** `src/utils/subscription/cadenceCompatibility.ts`:
- `billingPeriodMonths(period, count)` — effective months, or `null`
  for DAILY / WEEKLY / ONETIME.
- `isCadenceCompatible(subPeriod, subCount, itemPeriod, itemCount)` —
  mirrors backend `IsCadenceCompatible`.
- `cadenceFanoutCount(...)` — number of line-item cycles per
  subscription invoice window; `1` for same-cadence and ONETIME,
  `null` when incompatible.

Colocated tests in `cadenceCompatibility.test.ts` cover every combo of
DAILY/WEEKLY/MONTHLY/QUARTERLY/HALF_YEARLY/ANNUAL plus non-1 counts.

**Filter fix.** Two call sites used exact-match on `billing_period`:
- `filterPlanPricesForSubscriptionCharges` in
  `src/utils/subscription/planPricesForSubscriptionUi.ts`
- The parallel guard inside `SubscriptionPriceTable.tsx`

Both now use `isCadenceCompatible`, so a quarterly-sub view lists the
monthly-cadence prices that the backend will actually bill.

**Fan-out hint.** In `SubscriptionPriceTable.tsx`, when
`cadenceFanoutCount > 1` the charge cell shows a muted subtitle:
"Bills as {{count}} line items per subscription invoice." (Both en and
ar strings added under `subscriptionPriceTable.fanoutHint`.)

## Part 2 — deferred (needs backend field)

Goal: multi-select on the plan-prices table at sub-create, so a user
can leave a compatible price out of this particular subscription.

### Frontend UX

Column-1 checkbox on the SubscriptionPriceTable rows:

- Compatible prices: checkbox, all preselected. Deselecting removes
  the price from the subscription's line items on submit.
- Incompatible prices: not rendered (same as today; keeps the UI
  focused on prices that *could* attach).
- ONETIME prices: checkbox on, but "one-time" chip in place of the
  fan-out hint.

State model on `SubscriptionFormState`:
- `excludedPriceIds: Set<string>` (subset of the plan's compatible
  price ids). Empty set = "include everything the backend would
  auto-attach" (today's default behavior).

Cadence change reconciliation: when the user changes the subscription
`billing_period`, the set of compatible prices shifts. Rule: preserve
any `excludedPriceIds` still present in the new compatible set; drop
the rest. Do not silently re-include a price the user explicitly
deselected under the previous cadence if it happens to still be
compatible.

### Backend field this depends on

`CreateSubscriptionRequest` needs `include_price_ids?: string[]` (or
symmetrically `exclude_price_ids?: string[]`). Backend filter at
`internal/ee/service/subscription.go:3949` intersects the
compatible-price set with `include_price_ids` when present. When
omitted, current auto-attach behavior stands.

Frontend maps:
- No exclusions → omit the field (unchanged wire behavior).
- Any exclusions → send `include_price_ids = compatible_ids \ excluded`.

### Why we did not ship checkboxes now

Adding the checkbox column while backend still auto-attaches
everything would let users think they've excluded a price when the
resulting invoice still bills it — a silent correctness bug worse
than the pre-#2699 display drift. Once the backend field lands the
wire-up is mechanical (one field on the DTO, one Set on form state,
one filter step in submit).

## Explicit non-goals

- **Grouping fan-out rows on invoice display.** The invoice view
  already renders per-line-item `period_start` / `period_end`; three
  monthly rows just render as three rows. Any "collapse to one
  parent row" treatment is a separate design.
- **Usage display changes.** `GET /subscriptions/usage` is
  unchanged — still returns raw meter aggregation over the requested
  window.
- **Edit-subscription flow.** The plan-attach filter for existing
  subscriptions is a separate surface. This spec covers create only.
