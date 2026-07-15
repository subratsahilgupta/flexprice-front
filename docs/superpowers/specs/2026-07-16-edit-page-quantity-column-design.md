# Show Quantity Column on Subscription Edit Page (FIXED only)

## Problem

The subscription edit page's line-item table (`SubscriptionLineItemTable.tsx`) has no "Quantity" column — quantity is never shown there, for either FIXED or USAGE charges.

## Design

Add a "Quantity" column to the `columns` array in [SubscriptionLineItemTable.tsx](../../../src/components/molecules/SubscriptionLineItemTable/SubscriptionLineItemTable.tsx), positioned immediately before the existing "Charge" column (quantity and charge amount read naturally together).

- **FIXED-type rows**: render `row.quantity` as a plain number.
- **USAGE-type rows**: render `'--'`, matching this file's existing `'--'` fallback convention (already used for empty Display Name and missing Charge data).
- Price-type check: `row.price_type?.toUpperCase() === 'FIXED'`, matching the existing local convention in this file (line 346's `.toUpperCase() === 'USAGE'` check) rather than importing the `PRICE_TYPE` enum.

## Testing

Extend `SubscriptionLineItemTable.test.tsx` if one exists, or add a co-located test, covering: a FIXED row renders its numeric quantity; a USAGE row renders `'--'`.

## Out of scope

No change to the subscription creation page (`SubscriptionPriceTable.tsx`), which already handles this distinction for its own "Charge" column. No change to quantity editing behavior — this is a display-only addition.
