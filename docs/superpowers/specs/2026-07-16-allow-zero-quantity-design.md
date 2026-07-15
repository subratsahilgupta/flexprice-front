# Allow Zero Quantity on Subscription Line Items

## Problem

Subscription line item quantity should allow `0` as a valid value (e.g. to represent "no usage of this charge") while still rejecting negative values. Prices can define a `min_quantity`, but per product decision, `0` bypasses `min_quantity` entirely — any value `>= 0` is valid, `min_quantity` is only a UI default/placeholder, not an enforced floor.

## Investigation findings

Traced all quantity validation across the subscription creation, add-line-item, and quantity-modify flows. Two genuine bugs block `0` today; everything else already works correctly:

1. **[SubscriptionLineItemQuantityModifyDialog.tsx:30-34](../../../src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.tsx)** — `isValidPositiveQuantityString` explicitly requires `n > 0`, with error "Enter a valid quantity greater than zero." Used in the subscription modification (quantity-change) flow.
2. **[SubscriptionPriceTable.tsx:161](../../../src/components/organisms/Subscription/SubscriptionPriceTable.tsx)** — `parseInt(value, 10) || minQuantity` silently replaces a typed `0` with `minQuantity` because `0` is JS-falsy. No error is shown; the input just snaps back. Used in the subscription creation price-override table.

Already working, no change needed:
- **Add new line item flow** (`AddSubscriptionChargeDialog.tsx` → `RecurringChargesForm.tsx`) — the `min_quantity` field that seeds a new FIXED charge's quantity has no floor validation (`validate()` in `RecurringChargesForm.tsx` doesn't check `min_quantity` range at all), so `0` already passes through today.
- **Negative-number blocking** — already enforced at the keystroke level: `DecimalUsageInput` defaults `min=0`, and `Input variant="number"` defaults `allowNegative: false`. Neither of the two fixes below needs to add negative-rejection; it already exists.
- **Downstream request building** — `internalPriceToSubscriptionLineItemRequest.ts:143` (`quantity ?? internalPrice.min_quantity ?? 1`) and `price_override_helpers.ts:85-114` (`override.quantity !== undefined`) both use nullish/undefined checks, not falsy checks, so a `quantity: 0` that makes it past the two bugs above survives correctly to the API payload.
- **Backend** — confirmed already accepting `quantity: 0`; not a blocker for this change.

Out of scope: `CreateInvoice.tsx` invoice line items (`parseFloat(item.quantity) <= 0`) — a separate, unrelated flow (invoicing, not subscriptions), not touched by this change.

## Design

### Shared utility

New file `src/utils/subscription/quantityValidation.ts`:

```ts
export function isValidNonNegativeQuantityString(value: string): boolean {
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) return false;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0;
}
```

- Trims and strips comma thousand-separators (matches existing behavior in `SubscriptionLineItemQuantityModifyDialog.tsx`).
- Rejects: empty string, non-numeric, negative, `NaN`/`Infinity`.
- Accepts: `"0"`, `"0.00"`, positive integers/decimals.

### Call site 1: `SubscriptionLineItemQuantityModifyDialog.tsx`

- Delete the local `isValidPositiveQuantityString` function (lines 30-34).
- Import and call `isValidNonNegativeQuantityString` from the new util at the call site (line 90).
- Update the error message (line 91) from *"Enter a valid quantity greater than zero."* to *"Enter a valid quantity — zero or greater."*

### Call site 2: `SubscriptionPriceTable.tsx`

- Replace line 161:
  ```ts
  const quantity = parseInt(value, 10) || minQuantity;
  ```
  with:
  ```ts
  const parsed = parseInt(value, 10);
  const quantity = Number.isNaN(parsed) ? minQuantity : parsed;
  ```
- This preserves the existing fallback-to-`minQuantity` behavior for genuinely invalid input (e.g. non-numeric paste), while letting a typed `0` through as `0` instead of being silently replaced.
- This callsite parses integer strings from a table cell (not comma-formatted decimals), so it keeps its own lightweight `Number.isNaN` check rather than routing through the shared string-based util — the two checks solve related but distinctly-shaped problems (one validates a full form-submission string, the other guards an inline per-keystroke fallback).

### No changes needed

- `AddSubscriptionChargeDialog.tsx` / `RecurringChargesForm.tsx` — already permits 0.
- `internalPriceToSubscriptionLineItemRequest.ts`, `price_override_helpers.ts` — already pass 0 through correctly.
- Negative-number blocking at the input-component level — already in place.

## Testing plan

Add/extend co-located tests (`*.test.tsx` / `*.test.ts`):

1. **`quantityValidation.test.ts`** (new) — unit tests for `isValidNonNegativeQuantityString`: accepts `"0"`, `"0.00"`, `"5"`, `"1,000"`; rejects `""`, `"-1"`, `"-0.5"`, `"abc"`, `"NaN"`.
2. **`SubscriptionLineItemQuantityModifyDialog.test.tsx`** — typing `0` into the quantity field no longer shows the error and allows preview/apply to proceed; typing `-1` still shows an error; existing positive-quantity behavior unchanged.
3. **`SubscriptionPriceTable.test.tsx`** — typing `0` into a FIXED price's quantity cell results in an override with `quantity: 0` (not silently reset to `minQuantity`); typing invalid/non-numeric input still falls back to `minQuantity`; existing positive-quantity override behavior unchanged.

## Risks / assumptions

- Assumes backend already accepts `quantity: 0` on both the create-subscription and quantity-change-modify endpoints (confirmed by user, not independently verified against backend source in this repo).
