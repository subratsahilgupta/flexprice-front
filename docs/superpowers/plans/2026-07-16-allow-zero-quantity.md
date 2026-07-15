# Allow Zero Quantity on Subscription Line Items Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let subscription line item quantity be `0` (rejecting only negative values) in the subscription quantity-modify flow and the subscription-creation price-override table, per `docs/superpowers/specs/2026-07-16-allow-zero-quantity-design.md`.

**Architecture:** Two independent, narrowly-scoped fixes. (1) A new shared string-validation utility (`isValidNonNegativeQuantityString`) replaces the `n > 0` check in `SubscriptionLineItemQuantityModifyDialog`. (2) `SubscriptionPriceTable`'s inline `parseInt(value, 10) || minQuantity` falsy-coercion bug is fixed by extracting the fallback logic into a small exported pure function (`resolveQuantityFromInput`) so it can be unit-tested without mounting the full table. No other files change — the add-line-item flow and downstream request-building already handle `0` correctly (see spec's "Investigation findings").

**Tech Stack:** React 18 + TypeScript, Vitest, @testing-library/react, react-i18next, TanStack Query.

---

## Task 1: Shared quantity-validation utility

**Files:**
- Create: `src/utils/subscription/quantityValidation.ts`
- Test: `src/utils/subscription/quantityValidation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/utils/subscription/quantityValidation.test.ts
import { describe, expect, it } from 'vitest';
import { isValidNonNegativeQuantityString } from './quantityValidation';

describe('isValidNonNegativeQuantityString', () => {
	it('accepts zero', () => {
		expect(isValidNonNegativeQuantityString('0')).toBe(true);
		expect(isValidNonNegativeQuantityString('0.00')).toBe(true);
	});

	it('accepts positive integers and decimals', () => {
		expect(isValidNonNegativeQuantityString('5')).toBe(true);
		expect(isValidNonNegativeQuantityString('2.5')).toBe(true);
	});

	it('accepts comma-separated thousands', () => {
		expect(isValidNonNegativeQuantityString('1,000')).toBe(true);
	});

	it('trims surrounding whitespace', () => {
		expect(isValidNonNegativeQuantityString('  7  ')).toBe(true);
	});

	it('rejects negative numbers', () => {
		expect(isValidNonNegativeQuantityString('-1')).toBe(false);
		expect(isValidNonNegativeQuantityString('-0.5')).toBe(false);
	});

	it('rejects empty or whitespace-only input', () => {
		expect(isValidNonNegativeQuantityString('')).toBe(false);
		expect(isValidNonNegativeQuantityString('   ')).toBe(false);
	});

	it('rejects non-numeric input', () => {
		expect(isValidNonNegativeQuantityString('abc')).toBe(false);
		expect(isValidNonNegativeQuantityString('NaN')).toBe(false);
		expect(isValidNonNegativeQuantityString('Infinity')).toBe(false);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/utils/subscription/quantityValidation.test.ts`
Expected: FAIL — `Cannot find module './quantityValidation'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```ts
// src/utils/subscription/quantityValidation.ts

/**
 * Validates a raw quantity input string (as typed in a form field).
 * Accepts 0 and any positive number; rejects negative numbers, empty
 * strings, and non-numeric input. Strips comma thousand-separators
 * before parsing.
 */
export function isValidNonNegativeQuantityString(value: string): boolean {
	const trimmed = value.trim().replace(/,/g, '');
	if (!trimmed) return false;
	const n = Number(trimmed);
	return Number.isFinite(n) && n >= 0;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/utils/subscription/quantityValidation.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/subscription/quantityValidation.ts src/utils/subscription/quantityValidation.test.ts
git commit -m "feat: add isValidNonNegativeQuantityString utility"
```

---

## Task 2: Allow zero quantity in the quantity-modify dialog

**Files:**
- Modify: `src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.tsx:1-35,89-93`
- Test: `src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import type { i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import billingEn from '@/i18n/locales/en/billing.json';
import commonEn from '@/i18n/locales/en/common.json';
import { ENTITY_STATUS } from '@/models/base';
import { PRICE_TYPE } from '@/models/Price';
import { SUBSCRIPTION_MODIFY_TYPE } from '@/models/Subscription';
import type { LineItem } from '@/models/Subscription';
import SubscriptionLineItemQuantityModifyDialog from './SubscriptionLineItemQuantityModifyDialog';

const { mockPreview, mockExecute } = vi.hoisted(() => ({
	mockPreview: vi.fn(),
	mockExecute: vi.fn(),
}));

vi.mock('@/api/SubscriptionApi', () => ({
	default: { previewSubscriptionModify: mockPreview, executeSubscriptionModify: mockExecute },
}));
vi.mock('@/core/services/tanstack/ReactQueryProvider', () => ({ refetchQueries: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/core/services/supbase/config', () => ({ default: {} }));
vi.mock('@/core/auth/AuthService', () => ({ default: {} }));
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return { ...actual, useNavigate: () => vi.fn() };
});

let testI18n: I18nInstance;
beforeAll(async () => {
	const instance = createInstance();
	await instance.use(initReactI18next).init({
		lng: 'en',
		fallbackLng: 'en',
		ns: ['billing', 'common'],
		defaultNS: 'billing',
		resources: { en: { billing: billingEn, common: commonEn } },
		interpolation: { escapeValue: false },
	});
	testI18n = instance;
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
		<I18nextProvider i18n={testI18n}>
			<BrowserRouter>{children}</BrowserRouter>
		</I18nextProvider>
	</QueryClientProvider>
);

const lineItem: LineItem = {
	id: 'li_1',
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	created_by: 'user_1',
	updated_by: 'user_1',
	tenant_id: 'tenant_1',
	status: ENTITY_STATUS.PUBLISHED,
	environment_id: 'env_1',
	subscription_id: 'sub_1',
	customer_id: 'cust_1',
	price_id: 'price_1',
	meter_id: 'meter_1',
	display_name: 'Seats',
	plan_display_name: 'Pro Plan',
	meter_display_name: 'Seats meter',
	price_type: PRICE_TYPE.FIXED,
	billing_period: 'MONTHLY',
	currency: 'USD',
	quantity: 5,
	start_date: '',
	end_date: '',
	metadata: {},
};

beforeEach(() => {
	vi.clearAllMocks();
});

const renderDialog = () =>
	render(
		<Wrapper>
			<SubscriptionLineItemQuantityModifyDialog
				isOpen={true}
				onOpenChange={vi.fn()}
				subscriptionId='sub_1'
				lineItem={lineItem}
				currentPeriodStart='2026-01-01T00:00:00Z'
				currentPeriodEnd='2026-02-01T00:00:00Z'
			/>
		</Wrapper>,
	);

describe('SubscriptionLineItemQuantityModifyDialog', () => {
	it('allows a quantity of 0 and previews with quantity "0"', async () => {
		mockPreview.mockResolvedValue({ changed_resources: {} });
		renderDialog();

		fireEvent.change(screen.getByPlaceholderText('e.g. 10'), { target: { value: '0' } });
		fireEvent.click(screen.getByRole('button', { name: 'Preview' }));

		await waitFor(() => {
			expect(mockPreview).toHaveBeenCalledWith('sub_1', {
				type: SUBSCRIPTION_MODIFY_TYPE.QUANTITY_CHANGE,
				quantity_change_params: { line_items: [{ id: 'li_1', quantity: '0' }] },
			});
		});
		expect(screen.queryByText(/enter a valid quantity/i)).not.toBeInTheDocument();
	});

	it('rejects a negative quantity with an inline error and does not call preview', async () => {
		renderDialog();

		fireEvent.change(screen.getByPlaceholderText('e.g. 10'), { target: { value: '-1' } });
		fireEvent.click(screen.getByRole('button', { name: 'Preview' }));

		await waitFor(() => {
			expect(screen.getByText('Enter a valid quantity — zero or greater.')).toBeInTheDocument();
		});
		expect(mockPreview).not.toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.test.tsx`
Expected: FAIL — first test fails because typing `0` still triggers "Enter a valid quantity greater than zero." and `mockPreview` is never called.

- [ ] **Step 3: Update the dialog to allow zero**

In `src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.tsx`, add the import:

```ts
import { isValidNonNegativeQuantityString } from '@/utils/subscription/quantityValidation';
```

Delete the local function (lines 30-34):

```ts
function isValidPositiveQuantityString(q: string): boolean {
	const t = q.trim().replace(/,/g, '');
	if (!t) return false;
	const n = Number(t);
	return Number.isFinite(n) && n > 0;
}
```

Update `buildPayloadFromForm` (around line 90):

```ts
		if (!isValidNonNegativeQuantityString(quantityInput)) {
			setFormError('Enter a valid quantity — zero or greater.');
			return null;
		}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.tsx src/components/molecules/Subscription/SubscriptionLineItemQuantityModifyDialog.test.tsx
git commit -m "fix: allow zero quantity in subscription quantity-modify dialog"
```

---

## Task 3: Fix falsy-coercion bug in the subscription creation price table

**Files:**
- Modify: `src/components/organisms/Subscription/SubscriptionPriceTable.tsx:161`
- Test: `src/components/organisms/Subscription/SubscriptionPriceTable.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/organisms/Subscription/SubscriptionPriceTable.test.tsx
import { describe, expect, it } from 'vitest';
import { resolveQuantityFromInput } from './SubscriptionPriceTable';

describe('resolveQuantityFromInput', () => {
	it('returns 0 when the input is "0" instead of falling back to minQuantity', () => {
		expect(resolveQuantityFromInput('0', 1)).toBe(0);
	});

	it('parses positive integers', () => {
		expect(resolveQuantityFromInput('5', 1)).toBe(5);
	});

	it('falls back to minQuantity when the input does not parse to a number', () => {
		expect(resolveQuantityFromInput('abc', 3)).toBe(3);
	});

	it('truncates decimal input the same way parseInt does', () => {
		expect(resolveQuantityFromInput('4.9', 1)).toBe(4);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/organisms/Subscription/SubscriptionPriceTable.test.tsx`
Expected: FAIL — `resolveQuantityFromInput` is not exported from `./SubscriptionPriceTable` yet, and the first test would fail (`0 || 1` currently evaluates to `1`) once it is.

- [ ] **Step 3: Extract and use the pure function**

In `src/components/organisms/Subscription/SubscriptionPriceTable.tsx`, add this exported function near the top of the file (after the imports, before `DEFAULT_ROW_LIMIT`):

```ts
/**
 * Resolves the committed quantity from a table-cell input string.
 * Falls back to `minQuantity` only when the input doesn't parse to a
 * number at all — a typed "0" must resolve to 0, not fall back.
 */
export function resolveQuantityFromInput(value: string, minQuantity: number): number {
	const parsed = parseInt(value, 10);
	return Number.isNaN(parsed) ? minQuantity : parsed;
}
```

Replace line 161:

```ts
					const quantity = parseInt(value, 10) || minQuantity;
```

with:

```ts
					const quantity = resolveQuantityFromInput(value, minQuantity);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/organisms/Subscription/SubscriptionPriceTable.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/Subscription/SubscriptionPriceTable.tsx src/components/organisms/Subscription/SubscriptionPriceTable.test.tsx
git commit -m "fix: don't coerce a typed 0 quantity to minQuantity in price table"
```

---

## Task 4: Full verification pass

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All tests pass, including the three new/modified files above.

- [ ] **Step 2: Run the TypeScript + build check**

Run: `npm run build`
Expected: Succeeds with no type errors.

- [ ] **Step 3: Run lint**

Run: `npx eslint src/`
Expected: Zero errors.

- [ ] **Step 4: Manual smoke test in the browser**

Start the dev server, open a customer's "Create Subscription" page, add a FIXED price to the price table, and type `0` into its quantity cell — confirm the input keeps `0` (does not snap back to the price's minimum quantity) and no console errors appear. Then open an existing subscription's line item "Change quantity" dialog, type `0`, and confirm the Preview step proceeds without the old "greater than zero" error; type `-1` and confirm the inline error still appears and Preview is blocked.

---

## Self-review notes

- **Spec coverage:** Both bugs identified in the spec (`SubscriptionLineItemQuantityModifyDialog.tsx` positive-only check, `SubscriptionPriceTable.tsx` falsy coercion) are covered by Tasks 2 and 3. The spec's "no changes needed" areas (add-line-item flow, downstream request building, negative-number input blocking) are intentionally not touched.
- **Testability deviation from spec wording:** The spec described fixing `SubscriptionPriceTable.tsx:161` "inline." This plan instead extracts the fallback logic into a small exported pure function (`resolveQuantityFromInput`) so Task 3 can be unit-tested without mounting the full `SubscriptionPriceTable` organism (which requires a large `Props` surface — `FlexpriceTable`, coupon/override/commitment callbacks, etc.). The runtime behavior is identical to what the spec describes; only the test seam changed.
- **Type consistency:** `isValidNonNegativeQuantityString` (Task 1) is imported and used with the same name and signature in Task 2. `resolveQuantityFromInput` (Task 3) is defined and used with the same name and signature within the same file.
