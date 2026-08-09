# Exportable Credits Widgets (`src/credits/`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export `CreditBalance` and `CreditHistory` from `@flexprice/flexprice-ui`, replacing the dashboard's self-fetching `WalletBalanceWidget`/`WalletTransactionsWidget` with a presentational/container split — second of four plans (usage ✅ done, **credits** ← this plan, invoices, subscriptions) implementing the approved design spec at `docs/superpowers/specs/2026-08-08-exportable-usage-credits-invoices-design.md`.

**Architecture:** New `src/credits/` feature directory mirrors `src/usage/`'s shape exactly (`types.ts` / `schema.ts` / `i18n.ts` / `adapters.ts` / `lib.ts` / `components/` / `containers/`). Presentational components are exported (prop-only, `--fp-*` token classes, no router/context coupling); containers are dashboard-only. `TabRenderer.tsx` is repointed from `WalletBalanceWidget`/`WalletTransactionsWidget` to the new containers, and those two widget files are deleted.

**Tech Stack:** React 18, TypeScript, TanStack Query, Zod, Vitest + Testing Library, existing `@/lib/exportable/{validation,bundledI18n}` primitives.

## Global Constraints

- No `any` — Zod schemas for runtime validation.
- Tailwind utility classes only, bound to the existing `--fp-*` token set already shipped (`bg-surface`, `text-content`, `text-content-secondary`, `border-line`, `bg-accent-indigo-muted`, `text-accent-indigo`, `bg-destructive`, etc.). No `--portal-*`, no `PortalConfigContext` dependency anywhere in `src/credits/`.
- **Optional string schema fields MUST use a nullish-safe preprocessor, never bare `z.coerce.string().optional()`.** Bare `.optional()` only short-circuits `undefined`, not `null` — a JSON API returning `null` produces the literal string `"null"`. This was a real Important-severity bug caught in the usage-widgets plan's final review. Use: `const nullishToOptionalString = z.preprocess((v) => (v == null ? undefined : v), z.coerce.string().optional());`
- **Any new `common.<namespace>` block seeded in a bundled i18n hook (`createBundledT`) MUST be added to `src/i18n/locales/en/common.json` AND `src/i18n/locales/ar/common.json` in the SAME task/commit that creates the hook — never as a follow-up.** This was a Critical bug in the usage-widgets plan: `src/usage/i18n.ts` bundled `usageWidgets.*` as an external-consumer fallback, but the dashboard's own `common.json` never got the matching block, so the dashboard's host-i18n handoff (which always wins once the `common` namespace is loaded at all — the check is namespace-level, not per-key) resolved to nothing and rendered raw translation keys in production, in every locale. It shipped past 6 task-level reviews and 368 passing tests because `src/tests/setup.ts` never initializes a real i18next instance, so tests only ever exercised the bundled-fallback branch, never the host branch production actually takes. **Every task below that adds a bundled i18n block includes, as an explicit step, adding the matching keys to both locale files AND a regression test that initializes a real i18next instance with the `common` namespace and asserts a translated string renders (not the bundled bundled-fallback path).**
- No router dependency (`react-router`, `useSearchParams`, etc.) in any exported component or its props. The original `WalletTransactionsWidget` used `usePagination()` (an internal hook reading `useSearchParams` from `react-router`) — the exported `CreditHistory` instead takes fully controlled pagination props (`page`, `pageSize`, `totalItems`, `onPageChange`), and the dashboard-only container is the one that calls `usePagination()` internally and passes the result down as props. This mirrors how `PricingContainer` already uses `usePagination()` internally without leaking it into the exported `PricingTable`.
- Tests co-located: `*.test.ts` for pure modules, `*.test.tsx` for components.
- Each exported component runs its own `normalize*()` on its props as a defensive safety net; adapters are the authoritative validation/transformation boundary for the trusted dashboard path.
- `lib.ts` exports only component names — never a `*Container`.
- `npm run build:ui`, `npx tsc -b`, `npx eslint src/` must pass with zero errors.

## Scope note: reused shared molecules and their own i18n

`CreditHistory` reuses two existing shared molecules rather than reimplementing a table: `WalletTransactionsTable` (`src/components/molecules/Wallet/WalletTransactionsTable.tsx`, renders transaction-reason labels + column headers, already token-based — no `--portal-*`) and, transitively through it, `FlexpriceTable` (`src/components/molecules/Table/Table.tsx`, the generic table primitive used across dozens of unrelated pages).

`WalletTransactionsTable` calls `useTranslation('billing')` directly for ~19 keys it owns (transaction reasons, column headers) — the same class of bug as `CustomerUsageChart.tsx` had before the usage-widgets fix. This plan applies the same bundled-hook treatment to it (Task 2), since it's a small, low-blast-radius molecule specific to wallet transactions.

`FlexpriceTable` itself calls `useTranslation('common')` for exactly one pre-existing, ubiquitous key (`labels.na`) already used across the entire live dashboard — **this plan does NOT touch `FlexpriceTable`'s i18n.** It's used on dozens of unrelated pages; auditing/bundling its i18n is out of scope for a credits-specific plan, and `labels.na` is a stable, already-translated key with no drift risk (unlike the NEW `usageWidgets`/`creditWidgets`/`walletTransactionsTable` blocks this initiative is introducing). A bare external SDK consumer with zero i18next will see `FlexpriceTable`'s generic chrome untranslated, which is an accepted, explicit non-goal — not a regression, since that's already true today for every other page that renders `FlexpriceTable`. If this needs fixing later, it's a separate "make FlexpriceTable itself exportable-safe" initiative, not part of this plan.

## Directory layout

```
src/credits/
  types.ts / schema.ts / i18n.ts / adapters.ts / lib.ts
  components/
    CreditBalance.tsx
    CreditHistory.tsx
  containers/
    CreditBalanceContainer.tsx
    CreditHistoryContainer.tsx
```

---

## Task 1: `CreditBalance`

**Files:**
- Create: `src/credits/types.ts`
- Create: `src/credits/schema.ts`
- Create: `src/credits/i18n.ts`
- Create: `src/credits/adapters.ts`
- Create: `src/credits/components/CreditBalance.tsx`
- Create: `src/credits/containers/CreditBalanceContainer.tsx`
- Modify: `src/i18n/locales/en/common.json` — add `creditWidgets` block (sibling of `usageWidgets`, found at `en/common.json:525`)
- Modify: `src/i18n/locales/ar/common.json` — add `creditWidgets` block (sibling of `usageWidgets`, found at `ar/common.json:520`)
- Test: `src/credits/adapters.test.ts`
- Test: `src/credits/schema.test.ts`
- Test: `src/credits/components/CreditBalance.test.tsx` (including the host-i18n regression test — see Global Constraints)

**Interfaces:**
- Produces: `CreditBalanceData { id: string; name: string; status: 'active' | 'frozen' | 'closed'; creditBalance: number; balance: number; currency: string }`, `CreditBalanceProps { wallet: CreditBalanceData | null; isLoading?: boolean; className?: string }` (from `types.ts`); `adaptCreditBalance(wallet: WalletResponse, realtime?: RealtimeWalletBalance): CreditBalanceData` (from `adapters.ts`); `normalizeCreditBalanceData(input: unknown, onValidationError?): CreditBalanceData` (from `schema.ts`, single-object normalize — no array); `useCreditsT(): TFunction<'common'>` (from `i18n.ts`); default export `CreditBalance` (component) and `CreditBalanceContainer` (container).

- [ ] **Step 1: Write the failing adapter test**

```ts
// src/credits/adapters.test.ts
import { describe, it, expect } from 'vitest';
import { WALLET_STATUS } from '@/models/Wallet';
import { adaptCreditBalance } from './adapters';

const WALLET = {
	id: 'wallet_1',
	customer_id: 'cust_1',
	name: 'Main Wallet',
	currency: 'USD',
	description: '',
	balance: '100.50',
	credit_balance: '200',
	wallet_status: WALLET_STATUS.ACTIVE,
	metadata: {},
	wallet_type: 'PREPAID',
	config: { allowed_price_types: [] },
	conversion_rate: '1',
	created_at: '',
	updated_at: '',
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('adaptCreditBalance', () => {
	it('prefers realtime balance data over the wallet snapshot', () => {
		const result = adaptCreditBalance(WALLET, {
			currency: 'EUR',
			balance: '150.75',
			credit_balance: '300',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		expect(result).toEqual({ id: 'wallet_1', name: 'Main Wallet', status: 'active', creditBalance: 300, balance: 150.75, currency: 'EUR' });
	});

	it('falls back to the wallet snapshot when no realtime data is available', () => {
		const result = adaptCreditBalance(WALLET);
		expect(result).toEqual({ id: 'wallet_1', name: 'Main Wallet', status: 'active', creditBalance: 200, balance: 100.5, currency: 'USD' });
	});

	it('maps frozen and closed statuses', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptCreditBalance({ ...WALLET, wallet_status: WALLET_STATUS.FROZEN } as any).status).toBe('frozen');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptCreditBalance({ ...WALLET, wallet_status: WALLET_STATUS.CLOSED } as any).status).toBe('closed');
	});

	it('defaults currency to USD when neither source provides one', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = adaptCreditBalance({ ...WALLET, currency: '' } as any);
		expect(result.currency).toBe('USD');
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/credits/adapters.test.ts`
Expected: FAIL — `Cannot find module './adapters'`

- [ ] **Step 3: Create `src/credits/types.ts`**

```ts
// src/credits/types.ts
//
// Public presentational types for the credits widgets (balance, history).
//
// Decoupled from backend DTOs (WalletResponse / RealtimeWalletBalance / WalletTransaction).
// Containers map API responses INTO these shapes via `adapters.ts`, so backend schema changes
// never leak into the widgets' public contract.

// ── CreditBalance ────────────────────────────────────────────────────────────

export interface CreditBalanceData {
	id: string;
	name: string;
	status: 'active' | 'frozen' | 'closed';
	creditBalance: number;
	balance: number;
	currency: string;
}

export interface CreditBalanceProps {
	/** null renders the empty state (no wallet set up). */
	wallet: CreditBalanceData | null;
	isLoading?: boolean;
	className?: string;
}
```

- [ ] **Step 4: Create `src/credits/adapters.ts`**

```ts
// src/credits/adapters.ts
//
// Pure DTO → presentational mapping for the credits widgets. No React, no hooks — independently
// unit-testable. Containers call these to turn API responses into the widgets' typed
// presentational models. Mirrors `src/usage/adapters.ts`.
import { WALLET_STATUS } from '@/models/Wallet';
import type { WalletResponse } from '@/types/dto/Wallet';
import type { RealtimeWalletBalance } from '@/models/WalletBalance';
import type { CreditBalanceData } from './types';

const STATUS_MAP: Record<WALLET_STATUS, CreditBalanceData['status']> = {
	[WALLET_STATUS.ACTIVE]: 'active',
	[WALLET_STATUS.FROZEN]: 'frozen',
	[WALLET_STATUS.CLOSED]: 'closed',
};

/** Prefers the realtime balance query's values over the wallet list snapshot, matching the old widget's precedence. */
export function adaptCreditBalance(wallet: WalletResponse, realtime?: RealtimeWalletBalance): CreditBalanceData {
	return {
		id: wallet.id,
		name: wallet.name,
		status: STATUS_MAP[wallet.wallet_status] ?? 'active',
		creditBalance: Number(realtime?.credit_balance ?? wallet.credit_balance ?? 0),
		balance: Number(realtime?.balance ?? wallet.balance ?? 0),
		currency: realtime?.currency || wallet.currency || 'USD',
	};
}
```

- [ ] **Step 5: Run the adapter tests again**

Run: `npx vitest run src/credits/adapters.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Write the failing schema test**

```ts
// src/credits/schema.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeCreditBalanceData } from './schema';

describe('normalizeCreditBalanceData', () => {
	it('coerces valid input through unchanged', () => {
		const input = { id: 'w1', name: 'Main', status: 'active' as const, creditBalance: 100, balance: 50, currency: 'USD' };
		expect(normalizeCreditBalanceData(input)).toEqual(input);
	});

	it('falls back an invalid status to active', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeCreditBalanceData({ id: 'w1', name: 'X', status: 'bogus', creditBalance: 1, balance: 1, currency: 'USD' } as any);
		expect(result.status).toBe('active');
	});

	it('coerces malformed numeric fields to 0 instead of throwing', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeCreditBalanceData({ id: 'w1', name: 'X', status: 'active', creditBalance: 'oops', balance: null, currency: 'USD' } as any);
		expect(result.creditBalance).toBe(0);
		expect(result.balance).toBe(0);
	});

	it('repairs a missing id to empty string rather than throwing (single-object path never drops)', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeCreditBalanceData({ name: 'X', status: 'active', creditBalance: 1, balance: 1, currency: 'USD' } as any);
		expect(result.id).toBe('');
	});
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/credits/schema.test.ts`
Expected: FAIL — `Cannot find module './schema'`

- [ ] **Step 8: Create `src/credits/schema.ts`**

```ts
// src/credits/schema.ts
//
// Runtime validation / normalization boundary for the credits widgets.
//
// WHY: containers feed trusted, adapter-produced data, but external SDK consumers pass raw props
// from their own code/API. TypeScript disappears at runtime, so a JS consumer — or a TS one using
// `as any` — can hand us the wrong shape. Rather than crash (white screen), we coerce what we can
// and surface issues via `onValidationError`. Mirrors `src/usage/schema.ts`.
import { z } from 'zod';
import { createNormalizer, type NormalizerIssue } from '@/lib/exportable/validation';
import type { CreditBalanceData } from './types';

const nullishToString = z.preprocess((v) => (v == null ? '' : v), z.coerce.string()).catch('');
// Required-with-default variant: null/undefined fall back to 'USD' instead of the empty string.
const nullishToCurrency = z.preprocess((v) => (v == null || v === '' ? 'USD' : v), z.coerce.string()).catch('USD');

function devWarn(label: string) {
	return (issue: NormalizerIssue) => {
		if (import.meta.env?.DEV) console.warn(`[@flexprice/flexprice-ui] invalid ${label} dropped/normalized:`, issue);
	};
}

// ── CreditBalance ────────────────────────────────────────────────────────────

export const CreditBalanceDataSchema = z
	.object({
		id: nullishToString,
		name: nullishToString,
		status: z.enum(['active', 'frozen', 'closed']).catch('active'),
		creditBalance: z.coerce.number().catch(0),
		balance: z.coerce.number().catch(0),
		currency: nullishToCurrency,
	})
	.passthrough();

// Single-object normalizer (no array) — a lone `<CreditBalance>` never drops, it repairs.
const creditBalanceNormalizer = createNormalizer<CreditBalanceData>(CreditBalanceDataSchema);

export function normalizeCreditBalanceData<T extends object>(raw: T): CreditBalanceData {
	return creditBalanceNormalizer.normalizeOne(raw) as unknown as CreditBalanceData;
}
```

- [ ] **Step 9: Run the schema tests again**

Run: `npx vitest run src/credits/schema.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 10: Create `src/credits/i18n.ts`**

```ts
// src/credits/i18n.ts
//
// Bundled i18n so the credits widgets render real English out-of-the-box for external consumers —
// WITHOUT overriding a host app that has its own i18n (the dashboard localizes these to Arabic).
// Mirrors `src/usage/i18n.ts`. Namespace stays `'common'` so a host dashboard's own `common`
// bundle is reused for the handoff check; the bundled English defaults live under
// `common.creditWidgets`.
//
// IMPORTANT: whenever a key is added here, the matching key MUST also be added to
// `src/i18n/locales/en/common.json` and `src/i18n/locales/ar/common.json` in the same commit —
// see this plan's Global Constraints for why (a Critical bug in the usage-widgets plan shipped
// from skipping this).
import { createBundledT } from '@/lib/exportable/bundledI18n';

/** English defaults for the keys the credits widgets render (mirror of dashboard `customer-portal.wallet`). Extended by Task 2. */
const EN_CREDIT_WIDGETS = {
	defaultName: 'Wallet',
	balance: 'Balance',
	credits: 'credits',
	valueSuffix: 'value',
	emptyTitle: 'No wallet',
	emptyDescription: 'No wallet has been set up for this account',
	'status.active': 'Active',
	'status.frozen': 'Frozen',
	'status.closed': 'Closed',
};

export const useCreditsT = createBundledT('common', { creditWidgets: EN_CREDIT_WIDGETS }).useBoundT;
```

- [ ] **Step 11: Add the matching `creditWidgets` block to `src/i18n/locales/en/common.json`**

Find the `usageWidgets` block (starts at `en/common.json:525`) and add a new sibling key immediately after its closing `}`:

```json
	"creditWidgets": {
		"defaultName": "Wallet",
		"balance": "Balance",
		"credits": "credits",
		"valueSuffix": "value",
		"emptyTitle": "No wallet",
		"emptyDescription": "No wallet has been set up for this account",
		"status": {
			"active": "Active",
			"frozen": "Frozen",
			"closed": "Closed"
		}
	}
```

Match the file's existing tab indentation and comma conventions exactly (look at how `usageWidgets` is punctuated relative to its neighbors). The file must remain valid JSON.

- [ ] **Step 12: Add the matching `creditWidgets` block to `src/i18n/locales/ar/common.json`**

Same placement (sibling of `usageWidgets`, `ar/common.json:520`), Arabic values copied from the already-shipped `src/i18n/locales/ar/customer-portal.json`'s `wallet.*` block (read that file to confirm — `wallet.defaultName`, `wallet.balance`, `wallet.credits`, `wallet.valueSuffix`, `wallet.emptyTitle`, `wallet.emptyDescription`). For the three status labels, use the dashboard's existing `walletStatus.*` Arabic translations if present anywhere in `ar/customer-portal.json` (search for `"active"`, `"frozen"`, `"closed"` near a `walletStatus` key); if no existing translation is found, use these values:

```json
	"creditWidgets": {
		"defaultName": "محفظة",
		"balance": "الرصيد",
		"credits": "أرصدة",
		"valueSuffix": "قيمة",
		"emptyTitle": "لا توجد محفظة",
		"emptyDescription": "لم يتم إعداد محفظة لهذا الحساب",
		"status": {
			"active": "نشط",
			"frozen": "مجمد",
			"closed": "مغلق"
		}
	}
```

- [ ] **Step 13: Write the failing component test (including the host-i18n regression test)**

```tsx
// src/credits/components/CreditBalance.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import enCommon from '@/i18n/locales/en/common.json';
import CreditBalance from './CreditBalance';

describe('CreditBalance', () => {
	it('renders the wallet name, status, and balance', () => {
		render(
			<CreditBalance wallet={{ id: 'w1', name: 'Main Wallet', status: 'active', creditBalance: 200, balance: 100.5, currency: 'USD' }} />,
		);
		expect(screen.getByText('Main Wallet')).toBeInTheDocument();
	});

	it('renders the empty state when wallet is null', () => {
		render(<CreditBalance wallet={null} />);
		expect(screen.getByText('No wallet')).toBeInTheDocument();
	});

	it('renders a loading skeleton when isLoading', () => {
		const { container } = render(<CreditBalance wallet={null} isLoading />);
		expect(container.querySelector('.animate-pulse')).not.toBeNull();
	});

	it('renders a real translated title through a host i18next instance (regression test for the usage-widgets locale-key bug)', () => {
		const instance = createInstance();
		instance.init({ lng: 'en', fallbackLng: 'en', ns: ['common'], defaultNS: 'common', resources: { en: { common: enCommon } } });
		render(
			<I18nextProvider i18n={instance}>
				<CreditBalance wallet={null} />
			</I18nextProvider>,
		);
		// Must resolve through the HOST's real common.json — not the bundled fallback text, and never the raw key.
		expect(screen.getByText('No wallet')).toBeInTheDocument();
		expect(screen.queryByText('creditWidgets.emptyTitle')).not.toBeInTheDocument();
	});
});
```

- [ ] **Step 14: Run it to verify it fails**

Run: `npx vitest run src/credits/components/CreditBalance.test.tsx`
Expected: FAIL — `Cannot find module './CreditBalance'`

- [ ] **Step 15: Create `src/credits/components/CreditBalance.tsx`**

```tsx
// src/credits/components/CreditBalance.tsx
import { Card, Chip } from '@/components/atoms';
import { formatAmount } from '@/components/atoms/Input/Input';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { Wallet as WalletIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreditsT } from '../i18n';
import { normalizeCreditBalanceData } from '../schema';
import type { CreditBalanceProps } from '../types';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'failed' | 'default'> = {
	active: 'success',
	frozen: 'warning',
	closed: 'failed',
};

/**
 * Prop-only wallet-balance card — no fetching, no auth, no PortalConfigContext. Consumers supply
 * an already-adapted `wallet` (see `adaptCreditBalance`), or `null` for the empty state.
 */
const CreditBalance = ({ wallet: rawWallet, isLoading = false, className }: CreditBalanceProps) => {
	const wallet = rawWallet ? normalizeCreditBalanceData(rawWallet) : null;
	const t = useCreditsT();

	if (isLoading) {
		return (
			<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
				<div className='p-6 border-b border-line'>
					<div className='h-5 w-32 bg-surface-muted animate-pulse rounded' />
				</div>
				<div className='p-6'>
					<div className='animate-pulse space-y-3'>
						<div className='h-4 bg-surface-muted rounded w-20' />
						<div className='h-10 bg-surface-muted rounded w-32' />
					</div>
				</div>
			</Card>
		);
	}

	if (!wallet) {
		return (
			<Card noPadding className={cn('flexprice-ui', 'rounded-xl p-6 bg-surface', className)}>
				<div className='flex flex-col items-center justify-center py-16 px-4'>
					<p className='text-sm font-medium text-content-secondary mb-1'>{t('creditWidgets.emptyTitle')}</p>
					<p className='text-xs text-content-muted text-center max-w-sm mt-1'>{t('creditWidgets.emptyDescription')}</p>
				</div>
			</Card>
		);
	}

	const currencySymbol = getCurrencySymbol(wallet.currency);

	return (
		<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
			<div className='p-6 border-b border-line'>
				<div className='flex items-center gap-3'>
					<div className='h-10 w-10 rounded-full flex items-center justify-center bg-accent-indigo-muted'>
						<WalletIcon className='h-5 w-5 text-accent-indigo' />
					</div>
					<div>
						<h3 className='text-base font-medium text-content'>{wallet.name || t('creditWidgets.defaultName')}</h3>
						<Chip label={t(`creditWidgets.status.${wallet.status}`)} variant={STATUS_VARIANT[wallet.status] ?? 'default'} />
					</div>
				</div>
			</div>
			<div className='p-6'>
				<span className='text-sm block mb-2 text-content-secondary'>{t('creditWidgets.balance')}</span>
				<div className='flex items-baseline gap-2'>
					<span className='text-4xl font-semibold text-content'>{formatAmount(wallet.creditBalance.toString())}</span>
					<span className='text-base font-normal text-content-secondary'>{t('creditWidgets.credits')}</span>
				</div>
				<p className='text-sm mt-1 text-content-secondary'>
					{currencySymbol}
					{formatAmount(wallet.balance.toString())} {t('creditWidgets.valueSuffix')}
				</p>
			</div>
		</Card>
	);
};

export default CreditBalance;
```

- [ ] **Step 16: Run the component tests again**

Run: `npx vitest run src/credits/components/CreditBalance.test.tsx`
Expected: PASS (4 tests) — the 4th test is the one that would have failed before Steps 11–12 added the locale keys; confirm by temporarily commenting out the `creditWidgets` block you added to `en/common.json` and re-running just that test to see it fail with `creditWidgets.emptyTitle` rendered literally, then restore the block.

- [ ] **Step 17: Create the container**

```tsx
// src/credits/containers/CreditBalanceContainer.tsx
//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `CreditBalance`.
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { WALLET_STATUS } from '@/models/Wallet';
import { adaptCreditBalance } from '../adapters';
import CreditBalance from '../components/CreditBalance';

interface CreditBalanceContainerProps {
	className?: string;
}

const CreditBalanceContainer = ({ className }: CreditBalanceContainerProps) => {
	const { t } = useTranslation('customer-portal');

	const {
		data: wallets,
		isLoading: walletsLoading,
		isError: walletsError,
	} = useQuery({
		queryKey: ['portal-wallets'],
		queryFn: () => CustomerPortalApi.getWallets(),
	});

	const wallet = wallets?.find((w) => w.wallet_status === WALLET_STATUS.ACTIVE) || wallets?.[0];

	const { data: realtimeBalance, isLoading: balanceLoading } = useQuery({
		queryKey: ['portal-wallet-balance', wallet?.id],
		queryFn: () => CustomerPortalApi.getWalletBalance(wallet!.id),
		enabled: !!wallet?.id,
	});

	useEffect(() => {
		if (walletsError) toast.error(t('errors.loadWallet'));
	}, [walletsError, t]);

	if (walletsError) return null;

	const isLoading = walletsLoading || (!!wallet?.id && balanceLoading);
	const data = wallet ? adaptCreditBalance(wallet, realtimeBalance) : null;

	return <CreditBalance wallet={data} isLoading={isLoading} className={className} />;
};

export default CreditBalanceContainer;
```

- [ ] **Step 18: Full credits test suite + typecheck + lint**

Run: `npx vitest run src/credits/ && npx tsc -b && npx eslint src/credits`
Expected: All tests PASS, no type errors, no lint errors

- [ ] **Step 19: Validate both locale JSON files parse**

Run: `python3 -c "import json; json.load(open('src/i18n/locales/en/common.json')); json.load(open('src/i18n/locales/ar/common.json')); print('valid')"`
Expected: `valid`

- [ ] **Step 20: Commit**

```bash
git add src/credits/ src/i18n/locales/en/common.json src/i18n/locales/ar/common.json
git commit -m "feat(flexprice-ui): add exportable CreditBalance component"
```

---

## Task 2: `CreditHistory`

**Files:**
- Create: `src/components/molecules/Wallet/WalletTransactionsTable.i18n.ts`
- Modify: `src/components/molecules/Wallet/WalletTransactionsTable.tsx` — swap raw `useTranslation('billing')` for a bundled hook
- Modify: `src/credits/types.ts` — append `CreditTransaction` / `CreditWalletOption` / `CreditHistoryProps`
- Modify: `src/credits/schema.ts` — append `CreditTransactionSchema` / `normalizeCreditTransactions`
- Modify: `src/credits/i18n.ts` — extend `EN_CREDIT_WIDGETS`
- Modify: `src/credits/adapters.ts` — append `adaptCreditTransactions` / `adaptWalletOptions`
- Create: `src/credits/components/CreditHistory.tsx`
- Create: `src/credits/containers/CreditHistoryContainer.tsx`
- Modify: `src/i18n/locales/en/common.json` — extend the `creditWidgets` block added in Task 1; also add a new top-level `walletTransactionsTable` block for `WalletTransactionsTable`'s bundled keys (billing namespace keys copied verbatim, see Step 11 below)
- Modify: `src/i18n/locales/ar/common.json` — same
- Test: append to `src/credits/adapters.test.ts`, `src/credits/schema.test.ts`
- Test: `src/credits/components/CreditHistory.test.tsx`
- Test: `src/components/molecules/Wallet/WalletTransactionsTable.test.tsx` (new — host-i18n regression test for the molecule's own fix)

**Interfaces:**
- Produces: `CreditTransaction { id: string; type: 'credit' | 'debit'; amount: number; creditAmount: number; currency?: string; reason: string; createdAt: string; expiryDate?: string; priority?: number }`, `CreditWalletOption { id: string; label: string }`, `CreditHistoryProps { transactions: CreditTransaction[]; wallets?: CreditWalletOption[]; selectedWalletId?: string; onSelectWallet?: (walletId: string) => void; page: number; pageSize: number; totalItems: number; onPageChange: (page: number) => void; isLoading?: boolean; className?: string }`; `adaptCreditTransactions(items: WalletTransaction[]): CreditTransaction[]`; `adaptWalletOptions(wallets: WalletResponse[]): CreditWalletOption[]`; `normalizeCreditTransactions`; default export `CreditHistory`, `CreditHistoryContainer`; `useWalletTransactionsTableT()` from the new `WalletTransactionsTable.i18n.ts`.

### Step group A — `WalletTransactionsTable`'s own i18n fix

- [ ] **Step 1: Read the current content of `src/components/molecules/Wallet/WalletTransactionsTable.tsx`** to confirm its exact `useTranslation('billing')` usage and the exact key list it reads (`payments.transactions.*`, `wallet.table.*`) before editing.

- [ ] **Step 2: Create `src/components/molecules/Wallet/WalletTransactionsTable.i18n.ts`**

```ts
// src/components/molecules/Wallet/WalletTransactionsTable.i18n.ts
//
// Bundled i18n so WalletTransactionsTable renders real English out-of-the-box when reused by
// exportable components (e.g. @flexprice/flexprice-ui's CreditHistory) — WITHOUT overriding a
// host app that has its own i18n. Mirrors `src/components/molecules/CustomerUsageChart.i18n.ts`.
// Namespace is `'billing'` (not `'common'`) to match WalletTransactionsTable's existing
// `useTranslation('billing')` call — the host-i18n handoff only works if the namespace matches
// what the host actually has loaded.
import { createBundledT } from '@/lib/exportable/bundledI18n';

const EN_WALLET_TRANSACTIONS_TABLE = {
	payments: {
		transactions: {
			creditsSuffix: 'credits',
			reasonInvoicePayment: 'Invoice Payment',
			reasonFreeCreditGrant: 'Free Credits Added',
			reasonSubscriptionCreditGrant: 'Subscription Credits Added',
			reasonPurchasedCreditInvoiced: 'Purchased Credits (Invoiced)',
			reasonPurchasedCreditDirect: 'Purchased Credits',
			reasonInvoiceRefund: 'Invoice Refund',
			reasonCreditExpired: 'Credits Expired',
			reasonWalletTermination: 'Wallet Terminated',
			reasonCreditNote: 'Credit Note Refund',
			reasonManualBalanceDebit: 'Manual Debit',
			fallbackCredited: 'Credited',
			fallbackDebited: 'Debited',
		},
	},
	wallet: {
		table: {
			emptyCell: '--',
			columnTransactions: 'Transactions',
			columnPaymentDate: 'Payment Date',
			columnExpiryDate: 'Expiry Date',
			columnPriority: 'Priority',
			columnAmount: 'Amount',
		},
	},
};

export const useWalletTransactionsTableT = createBundledT('billing', EN_WALLET_TRANSACTIONS_TABLE).useBoundT;
```

Note the shape: unlike `src/usage/i18n.ts` (which nests its bundle under a single `usageWidgets` key), this one seeds `payments.transactions.*` and `wallet.table.*` directly at the bundle root, because `WalletTransactionsTable.tsx` calls `t('payments.transactions.creditsSuffix')` and `t('wallet.table.emptyCell')` — i.e. those ARE the top-level paths under the `billing` namespace already, matching the real `en/billing.json`'s structure. Do not add an extra nesting level.

- [ ] **Step 3: Update `src/components/molecules/Wallet/WalletTransactionsTable.tsx`**

Replace:
```ts
import { useTranslation } from 'react-i18next';
```
with:
```ts
import { useWalletTransactionsTableT } from './WalletTransactionsTable.i18n';
```
Replace:
```ts
	const { t } = useTranslation('billing');
```
with:
```ts
	const t = useWalletTransactionsTableT();
```

This is behavior-preserving for the table's existing callers inside the dashboard (it's currently only rendered by `WalletTransactionsWidget`, which this plan's Task 4 deletes and replaces — but the fix itself doesn't depend on that; it's correct regardless of caller).

- [ ] **Step 4: Confirm no locale file edit is needed here (unlike Task 1)**

`WalletTransactionsTable` uses the `billing` namespace (not `common`), and `src/i18n/locales/en/billing.json` / `ar/billing.json` **already have every one of these keys** (verified: `payments.transactions.*` and `wallet.table.*` both already exist in both files with the exact values used in Step 2's bundle — this table has been live in the dashboard for a while). So, unlike Task 1's `creditWidgets` block (a brand-new namespace with no prior locale entries), **no locale file edit is needed for this step** — the dashboard's `billing` namespace already serves these keys correctly, and the bundled hook is purely additive for external consumers who have no i18next at all. Confirm this yourself by reading `src/i18n/locales/en/billing.json`'s `payments.transactions` and `wallet.table` sections and diffing against Step 2's `EN_WALLET_TRANSACTIONS_TABLE` object — they should match exactly. Then proceed to Step 5's regression test, which proves the fix works end-to-end (asserts the HOST's real `billing.json` values render, not the bundled fallback).

- [ ] **Step 5: Write the host-i18n regression test for `WalletTransactionsTable`**

```tsx
// src/components/molecules/Wallet/WalletTransactionsTable.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import enBilling from '@/i18n/locales/en/billing.json';
import { WALLET_TRANSACTION_REASON } from '@/models/Wallet';
import WalletTransactionsTable from './WalletTransactionsTable';

describe('WalletTransactionsTable', () => {
	it('renders a real translated transaction-reason label through a host i18next instance', () => {
		const instance = createInstance();
		instance.init({ lng: 'en', fallbackLng: 'en', ns: ['billing'], defaultNS: 'billing', resources: { en: { billing: enBilling } } });
		render(
			<I18nextProvider i18n={instance}>
				<WalletTransactionsTable
					data={[
						{
							amount: 100,
							balance_after: 200,
							balance_before: 100,
							created_at: '2026-01-01T00:00:00Z',
							description: '',
							id: 'tx_1',
							metadata: {},
							reference_id: '',
							reference_type: '',
							transaction_status: 'completed',
							type: 'credit',
							wallet_id: 'w1',
							credit_amount: 100,
							transaction_reason: WALLET_TRANSACTION_REASON.FREE_CREDIT_GRANT,
							expiry_date: '',
						},
					]}
				/>,
			</I18nextProvider>,
		);
		expect(screen.getByText('Free Credits Added')).toBeInTheDocument();
	});
});
```

- [ ] **Step 6: Run it and confirm it passes against the real host locale**

Run: `npx vitest run src/components/molecules/Wallet/WalletTransactionsTable.test.tsx`
Expected: PASS (1 test)

### Step group B — `adaptCreditTransactions` / `adaptWalletOptions`

- [ ] **Step 7: Write the failing adapter test (append to `src/credits/adapters.test.ts`)**

```ts
// append to src/credits/adapters.test.ts
import { adaptCreditTransactions, adaptWalletOptions } from './adapters';
import { WALLET_TRANSACTION_REASON } from '@/models/Wallet';

describe('adaptCreditTransactions', () => {
	it('maps transaction fields', () => {
		const result = adaptCreditTransactions([
			{
				id: 'tx_1',
				amount: 100,
				balance_after: 200,
				balance_before: 100,
				created_at: '2026-01-01T00:00:00Z',
				description: '',
				metadata: {},
				reference_id: '',
				reference_type: '',
				transaction_status: 'completed',
				type: 'credit',
				wallet_id: 'w1',
				credit_amount: 90,
				transaction_reason: WALLET_TRANSACTION_REASON.FREE_CREDIT_GRANT,
				expiry_date: '2026-06-01T00:00:00Z',
				priority: 1,
				currency: 'USD',
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		] as any);
		expect(result).toEqual([
			{
				id: 'tx_1',
				type: 'credit',
				amount: 100,
				creditAmount: 90,
				currency: 'USD',
				reason: WALLET_TRANSACTION_REASON.FREE_CREDIT_GRANT,
				createdAt: '2026-01-01T00:00:00Z',
				expiryDate: '2026-06-01T00:00:00Z',
				priority: 1,
			},
		]);
	});

	it('treats any non-debit type as credit, and leaves an empty expiry_date undefined', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = adaptCreditTransactions([{ id: 'tx_2', type: 'debit', amount: 5, credit_amount: 5, created_at: '', transaction_reason: 'X', expiry_date: '' }] as any);
		expect(result[0].type).toBe('debit');
		expect(result[0].expiryDate).toBeUndefined();
	});

	it('returns [] for empty/undefined input', () => {
		expect(adaptCreditTransactions([])).toEqual([]);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptCreditTransactions(undefined as any)).toEqual([]);
	});
});

describe('adaptWalletOptions', () => {
	it('maps wallets to id/label options', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = adaptWalletOptions([{ id: 'w1', name: 'Main' }, { id: 'w2', name: '' }] as any);
		expect(result).toEqual([{ id: 'w1', label: 'Main' }, { id: 'w2', label: '' }]);
	});
});
```

- [ ] **Step 8: Run it to verify it fails**

Run: `npx vitest run src/credits/adapters.test.ts`
Expected: FAIL — `adaptCreditTransactions is not a function`

- [ ] **Step 9: Append `CreditTransaction` / `CreditWalletOption` / `CreditHistoryProps` to `src/credits/types.ts`**

```ts
// append to src/credits/types.ts

// ── CreditHistory ────────────────────────────────────────────────────────────

export interface CreditTransaction {
	id: string;
	type: 'credit' | 'debit';
	amount: number;
	creditAmount: number;
	currency?: string;
	reason: string;
	createdAt: string;
	expiryDate?: string;
	priority?: number;
}

export interface CreditWalletOption {
	id: string;
	label: string;
}

export interface CreditHistoryProps {
	transactions: CreditTransaction[];
	/** Only rendered as a selector when there's more than one entry. */
	wallets?: CreditWalletOption[];
	selectedWalletId?: string;
	onSelectWallet?: (walletId: string) => void;
	/** Fully controlled pagination — no router dependency. See this plan's Global Constraints. */
	page: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
	className?: string;
}
```

- [ ] **Step 10: Append `adaptCreditTransactions` / `adaptWalletOptions` to `src/credits/adapters.ts`**

```ts
// append to src/credits/adapters.ts
import type { WalletTransaction } from '@/models/WalletTransaction';
import type { CreditTransaction, CreditWalletOption } from './types';

export function adaptCreditTransactions(items: WalletTransaction[]): CreditTransaction[] {
	return (items ?? []).map((tx) => ({
		id: tx.id,
		type: tx.type === 'debit' ? 'debit' : 'credit',
		amount: Number(tx.amount) || 0,
		creditAmount: Number(tx.credit_amount) || 0,
		currency: tx.currency,
		reason: tx.transaction_reason,
		createdAt: tx.created_at,
		expiryDate: tx.expiry_date || undefined,
		priority: tx.priority,
	}));
}

export function adaptWalletOptions(wallets: WalletResponse[]): CreditWalletOption[] {
	return (wallets ?? []).map((w) => ({ id: w.id, label: w.name || '' }));
}
```

(Merge the `import type { ... } from '@/types/dto/Wallet'` — `WalletResponse` is already imported by Task 1's `adaptCreditBalance`; add `WalletResponse` there if it isn't already, don't duplicate the import statement.)

- [ ] **Step 11: Run the adapter tests again**

Run: `npx vitest run src/credits/adapters.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 12: Write the failing schema test (append to `src/credits/schema.test.ts`)**

```ts
// append to src/credits/schema.test.ts
import { normalizeCreditTransactions } from './schema';

describe('normalizeCreditTransactions', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 't1', type: 'credit' as const, amount: 10, creditAmount: 10, reason: 'X', createdAt: '2026-01-01' }];
		expect(normalizeCreditTransactions(input)).toEqual(input);
	});

	it('normalizes a null currency to undefined, not the string "null"', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeCreditTransactions([{ id: 't1', type: 'credit', amount: 1, creditAmount: 1, reason: 'X', createdAt: '', currency: null }] as any);
		expect(result[0].currency).toBeUndefined();
	});

	it('falls back an invalid type to credit', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeCreditTransactions([{ id: 't1', type: 'bogus', amount: 1, creditAmount: 1, reason: 'X', createdAt: '' }] as any);
		expect(result[0].type).toBe('credit');
	});
});
```

- [ ] **Step 13: Run it to verify it fails**

Run: `npx vitest run src/credits/schema.test.ts`
Expected: FAIL — `normalizeCreditTransactions is not a function`

- [ ] **Step 14: Append `CreditTransactionSchema` / `normalizeCreditTransactions` to `src/credits/schema.ts`**

Merge `CreditTransaction` into Task 1's existing `import type { CreditBalanceData } from './types';` line at the top of the file, so it reads `import type { CreditBalanceData, CreditTransaction } from './types';` — do not add a second, competing import statement.

```ts
// append to src/credits/schema.ts (below Task 1's content)

// Per this plan's Global Constraints: optional string fields use the nullish-safe preprocessor,
// never bare `z.coerce.string().optional()` (null must become undefined, not the string "null").
const nullishToOptionalString = z.preprocess((v) => (v == null ? undefined : v), z.coerce.string().optional());
const nullishToOptionalNumber = z.preprocess((v) => (v == null ? undefined : v), z.coerce.number().optional());

// ── CreditHistory ────────────────────────────────────────────────────────────

export const CreditTransactionSchema = z
	.object({
		id: nullishToString,
		type: z.enum(['credit', 'debit']).catch('credit'),
		amount: z.coerce.number().catch(0),
		creditAmount: z.coerce.number().catch(0),
		currency: nullishToOptionalString,
		reason: nullishToString,
		createdAt: nullishToString,
		expiryDate: nullishToOptionalString,
		priority: nullishToOptionalNumber,
	})
	.passthrough();

const creditTransactionNormalizer = createNormalizer<CreditTransaction>(CreditTransactionSchema);

export function normalizeCreditTransactions(input: unknown, onValidationError?: (issue: NormalizerIssue) => void): CreditTransaction[] {
	return creditTransactionNormalizer.normalizeMany(input, onValidationError ?? devWarn('credit transaction'));
}
```

- [ ] **Step 15: Run the schema tests again**

Run: `npx vitest run src/credits/schema.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 16: Extend `EN_CREDIT_WIDGETS` in `src/credits/i18n.ts`**

```ts
// add to EN_CREDIT_WIDGETS in src/credits/i18n.ts
	transactionHistory: 'Transaction History',
	noTransactionsTitle: 'No transactions',
	noTransactionsDescription: 'Your transaction history will appear here',
	fallbackWalletName: 'Wallet {{id}}',
```

- [ ] **Step 17: Add the 4 new keys to `src/i18n/locales/en/common.json`'s `creditWidgets` block (added in Task 1)**

```json
		"transactionHistory": "Transaction History",
		"noTransactionsTitle": "No transactions",
		"noTransactionsDescription": "Your transaction history will appear here",
		"fallbackWalletName": "Wallet {{id}}"
```

- [ ] **Step 18: Add the same 4 keys, translated, to `src/i18n/locales/ar/common.json`'s `creditWidgets` block**

Arabic values already exist in `src/i18n/locales/ar/customer-portal.json`'s `wallet.transactionHistory`, `wallet.noTransactionsTitle`, `wallet.noTransactionsDescription`, `wallet.fallbackName` — read that file and copy them verbatim (fallbackName uses `{{id}}` interpolation — preserve it exactly).

- [ ] **Step 19: Write the failing component test**

```tsx
// src/credits/components/CreditHistory.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import CreditHistory from './CreditHistory';

const TRANSACTIONS = [
	{ id: 't1', type: 'credit' as const, amount: 100, creditAmount: 100, reason: 'FREE_CREDIT_GRANT', createdAt: '2026-01-01T00:00:00Z' },
];

describe('CreditHistory', () => {
	it('renders the transaction history title and table', () => {
		render(<CreditHistory transactions={TRANSACTIONS} page={1} pageSize={10} totalItems={1} onPageChange={vi.fn()} />);
		expect(screen.getByText('Transaction History')).toBeInTheDocument();
	});

	it('renders the empty state when there are no transactions', () => {
		render(<CreditHistory transactions={[]} page={1} pageSize={10} totalItems={0} onPageChange={vi.fn()} />);
		expect(screen.getByText('No transactions')).toBeInTheDocument();
	});

	it('renders a loading skeleton when isLoading', () => {
		const { container } = render(<CreditHistory transactions={[]} page={1} pageSize={10} totalItems={0} onPageChange={vi.fn()} isLoading />);
		expect(container.querySelector('.animate-pulse')).not.toBeNull();
	});

	it('renders a wallet selector only when more than one wallet is supplied', () => {
		const { rerender } = render(
			<CreditHistory transactions={TRANSACTIONS} wallets={[{ id: 'w1', label: 'Main' }]} page={1} pageSize={10} totalItems={1} onPageChange={vi.fn()} />,
		);
		expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
		rerender(
			<CreditHistory
				transactions={TRANSACTIONS}
				wallets={[{ id: 'w1', label: 'Main' }, { id: 'w2', label: 'Backup' }]}
				page={1}
				pageSize={10}
				totalItems={1}
				onPageChange={vi.fn()}
			/>,
		);
		expect(screen.getByRole('combobox')).toBeInTheDocument();
	});
});
```

- [ ] **Step 20: Run it to verify it fails**

Run: `npx vitest run src/credits/components/CreditHistory.test.tsx`
Expected: FAIL — `Cannot find module './CreditHistory'`

- [ ] **Step 21: Create `src/credits/components/CreditHistory.tsx`**

```tsx
// src/credits/components/CreditHistory.tsx
import { useMemo } from 'react';
import { Card, Select } from '@/components/atoms';
import { ShortPaginationControls } from '@/components/atoms/ShortPagination/ShortPagination';
import { WalletTransactionsTable } from '@/components/molecules';
import { cn } from '@/lib/utils';
import { useCreditsT } from '../i18n';
import { normalizeCreditTransactions } from '../schema';
import type { CreditHistoryProps } from '../types';
import type { WalletTransaction } from '@/models/WalletTransaction';

/**
 * Prop-only wallet-transaction history — no fetching, no auth, no PortalConfigContext, no router.
 * Pagination is fully controlled via `page`/`pageSize`/`totalItems`/`onPageChange` (the old
 * internal widget read/wrote page state from the URL via `usePagination()`; this component never
 * does — see this plan's Global Constraints). Consumers supply already-adapted `transactions`
 * (see `adaptCreditTransactions`) and, for multi-wallet accounts, `wallets` (see `adaptWalletOptions`).
 */
const CreditHistory = ({
	transactions: rawTransactions,
	wallets,
	selectedWalletId,
	onSelectWallet,
	page,
	pageSize,
	totalItems,
	onPageChange,
	isLoading = false,
	className,
}: CreditHistoryProps) => {
	const transactions = useMemo(() => normalizeCreditTransactions(rawTransactions), [rawTransactions]);
	const t = useCreditsT();

	if (isLoading) {
		return (
			<div className={cn('flexprice-ui', 'space-y-6', className)}>
				<Card noPadding className='rounded-xl overflow-hidden bg-surface'>
					<div className='p-6 border-b border-line'>
						<div className='h-5 w-40 bg-surface-muted animate-pulse rounded' />
					</div>
					<div className='p-6 space-y-3'>
						{[1, 2, 3].map((i) => (
							<div key={i} className='h-12 bg-surface-muted animate-pulse rounded' />
						))}
					</div>
				</Card>
			</div>
		);
	}

	// FlexpriceTable/WalletTransactionsTable expects the real WalletTransaction shape for fields
	// this component's decoupled model doesn't carry (balance_after/before, description, etc.) —
	// those aren't rendered by any column WalletTransactionsTable defines, so a minimal cast with
	// safe defaults for the untouched fields keeps the table's existing render logic unchanged.
	const tableData: WalletTransaction[] = transactions.map((tx) => ({
		id: tx.id,
		amount: tx.amount,
		credit_amount: tx.creditAmount,
		currency: tx.currency,
		type: tx.type,
		transaction_reason: tx.reason,
		created_at: tx.createdAt,
		expiry_date: tx.expiryDate ?? '',
		priority: tx.priority,
		balance_after: 0,
		balance_before: 0,
		description: '',
		metadata: {},
		reference_id: '',
		reference_type: '',
		transaction_status: '',
		wallet_id: '',
	}));

	return (
		<div className={cn('flexprice-ui', 'space-y-6', className)}>
			{wallets && wallets.length > 1 && (
				<Select
					value={selectedWalletId || ''}
					onChange={(value) => onSelectWallet?.(value)}
					options={wallets.map((w) => ({ value: w.id, label: w.label }))}
					className='w-full max-w-xs'
				/>
			)}

			<Card noPadding className='rounded-xl overflow-hidden bg-surface'>
				<div className='p-6 border-b border-line'>
					<h3 className='text-base font-medium text-content'>{t('creditWidgets.transactionHistory')}</h3>
				</div>
				<div className='p-6'>
					{transactions.length > 0 ? (
						<>
							<WalletTransactionsTable data={tableData} />
							<ShortPaginationControls page={page} onPageChange={onPageChange} totalItems={totalItems} pageSize={pageSize} unit={t('creditWidgets.transactionHistory')} />
						</>
					) : (
						<div className='flex flex-col items-center justify-center py-16 px-4'>
							<p className='text-sm font-medium text-content-secondary mb-1'>{t('creditWidgets.noTransactionsTitle')}</p>
							<p className='text-xs text-content-muted text-center max-w-sm mt-1'>{t('creditWidgets.noTransactionsDescription')}</p>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};

export default CreditHistory;
```

- [ ] **Step 22: Run the component tests again**

Run: `npx vitest run src/credits/components/CreditHistory.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 23: Create the container**

```tsx
// src/credits/containers/CreditHistoryContainer.tsx
//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `CreditHistory`.
// Owns `usePagination()` (router-coupled) and translates its output into the fully controlled
// `page`/`pageSize`/`totalItems`/`onPageChange` props the exported `CreditHistory` expects.
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { WALLET_STATUS } from '@/models/Wallet';
import usePagination, { PAGINATION_PREFIX } from '@/hooks/usePagination';
import { adaptCreditTransactions, adaptWalletOptions } from '../adapters';
import CreditHistory from '../components/CreditHistory';

interface CreditHistoryContainerProps {
	className?: string;
}

const CreditHistoryContainer = ({ className }: CreditHistoryContainerProps) => {
	const { t } = useTranslation('customer-portal');
	const { page, setPage, limit, offset } = usePagination({ prefix: PAGINATION_PREFIX.WALLET_TRANSACTIONS });
	const [selectedWalletId, setSelectedWalletId] = useState<string>('');

	const {
		data: wallets,
		isLoading: walletsLoading,
		isError: walletsError,
	} = useQuery({
		queryKey: ['portal-wallets'],
		queryFn: () => CustomerPortalApi.getWallets(),
	});

	const activeWallet = selectedWalletId
		? wallets?.find((w) => w.id === selectedWalletId)
		: wallets?.find((w) => w.wallet_status === WALLET_STATUS.ACTIVE) || wallets?.[0];

	const {
		data: transactionsData,
		isLoading: transactionsLoading,
		isError: transactionsError,
	} = useQuery({
		queryKey: ['portal-wallet-transactions', activeWallet?.id, limit, offset],
		queryFn: () => CustomerPortalApi.getWalletTransactions({ walletId: activeWallet!.id, limit, offset }),
		enabled: !!activeWallet?.id,
	});

	useEffect(() => {
		if (walletsError) toast.error(t('errors.loadWallets'));
	}, [walletsError, t]);
	useEffect(() => {
		if (transactionsError) toast.error(t('errors.loadTransactions'));
	}, [transactionsError, t]);

	const isLoading = walletsLoading || (!!activeWallet?.id && transactionsLoading);
	const transactions = adaptCreditTransactions(transactionsData?.items ?? []);
	const walletOptions = adaptWalletOptions(wallets ?? []);

	return (
		<CreditHistory
			transactions={transactions}
			wallets={walletOptions}
			selectedWalletId={activeWallet?.id}
			onSelectWallet={setSelectedWalletId}
			page={page}
			pageSize={limit}
			totalItems={transactionsData?.pagination?.total ?? 0}
			onPageChange={setPage}
			isLoading={isLoading}
			className={className}
		/>
	);
};

export default CreditHistoryContainer;
```

- [ ] **Step 24: Full credits + Wallet molecule test suite + typecheck + lint**

Run: `npx vitest run src/credits/ src/components/molecules/Wallet/ && npx tsc -b && npx eslint src/credits src/components/molecules/Wallet`
Expected: All tests PASS, no type errors, no lint errors

- [ ] **Step 25: Validate both locale JSON files parse**

Run: `python3 -c "import json; json.load(open('src/i18n/locales/en/common.json')); json.load(open('src/i18n/locales/ar/common.json')); print('valid')"`
Expected: `valid`

- [ ] **Step 26: Commit**

```bash
git add src/credits/ src/components/molecules/Wallet/WalletTransactionsTable.tsx src/components/molecules/Wallet/WalletTransactionsTable.i18n.ts src/components/molecules/Wallet/WalletTransactionsTable.test.tsx src/i18n/locales/en/common.json src/i18n/locales/ar/common.json
git commit -m "feat(flexprice-ui): add exportable CreditHistory component"
```

---

## Task 3: Wire into the published package

**Files:**
- Create: `src/credits/lib.ts`
- Modify: `src/exportable/index.ts`
- Modify: `tailwind.flexprice-ui.config.js`
- Modify: `vite.flexprice-ui.config.ts`

- [ ] **Step 1: Create `src/credits/lib.ts`**

```ts
// src/credits/lib.ts
//
// Credits widgets — FEATURE public surface (presentational only).
//
// Aggregated into the published package via `src/exportable/index.ts` (@flexprice/flexprice-ui).
// Exposes ONLY prop-only UI + pure helpers, so the published bundle never drags in the dashboard's
// data layer (axios/auth/router/react-query). "Bring your own data": fetch wallets/transactions
// however you like, map them to the widgets' presentational shapes (via the exported adapters, or
// build the shapes yourself), and render.
//
// Containers (dashboard-only, data-connected) live in `./containers/` and are intentionally NOT
// re-exported here.

export { default as CreditBalance } from './components/CreditBalance';
export { default as CreditHistory } from './components/CreditHistory';

export type { CreditBalanceData, CreditBalanceProps } from './types';
export type { CreditTransaction, CreditWalletOption, CreditHistoryProps } from './types';

export { normalizeCreditBalanceData, normalizeCreditTransactions } from './schema';

export { adaptCreditBalance, adaptCreditTransactions, adaptWalletOptions } from './adapters';
```

- [ ] **Step 2: Modify `src/exportable/index.ts`**

Replace:
```ts
// ── Usage widgets ────────────────────────────────────────────────────────────
export * from '@/usage/lib';

// ── Future components (uncomment as they become exportable) ───────────────────
// export * from '@/checkout/lib';
// export * from '@/credits/lib';
// export * from '@/invoices/lib';
// export * from '@/subscriptions/lib';
```
with:
```ts
// ── Usage widgets ────────────────────────────────────────────────────────────
export * from '@/usage/lib';

// ── Credits widgets ──────────────────────────────────────────────────────────
export * from '@/credits/lib';

// ── Future components (uncomment as they become exportable) ───────────────────
// export * from '@/checkout/lib';
// export * from '@/invoices/lib';
// export * from '@/subscriptions/lib';
```

- [ ] **Step 3: Modify `tailwind.flexprice-ui.config.js`**

Insert after the existing usage-widgets glob block (after `'./src/components/atoms/Label/**/*.{ts,tsx}',` stays last, or wherever the usage block currently ends — read the file first) and before the closing `]`:
```js
			// Credits widgets + the shared atoms/molecules/ui they render.
			'./src/credits/**/*.{ts,tsx}',
			'./src/components/molecules/Wallet/WalletTransactionsTable.tsx',
			'./src/components/molecules/Wallet/WalletTransactionsTable.i18n.ts',
			'./src/components/atoms/ShortPagination/**/*.{ts,tsx}',
			'./src/components/atoms/Chip/**/*.{ts,tsx}',
```
(`./src/components/molecules/Table/**/*.{ts,tsx}`, `./src/components/atoms/Card/**/*.{ts,tsx}`, `./src/components/ui/**/*.{ts,tsx}`, and `./src/components/atoms/Select/**/*.{ts,tsx}` are already globbed from the usage/pricing work — don't duplicate them.)

- [ ] **Step 4: Modify `vite.flexprice-ui.config.ts`**

Add to the `dtsInclude` array:
```ts
		'src/credits/**/*.ts',
		'src/credits/**/*.tsx',
```

- [ ] **Step 5: Build the package and verify the new exports are present**

Run: `npm run build:ui`
Expected: Build succeeds. Then run: `grep -c "CreditBalance\|CreditHistory" packages/flexprice-ui/dist/flexprice-ui.d.mts`
Expected: A non-zero count.

- [ ] **Step 6: Commit**

```bash
git add src/credits/lib.ts src/exportable/index.ts tailwind.flexprice-ui.config.js vite.flexprice-ui.config.ts
git commit -m "feat(flexprice-ui): publish the 2 credits widgets from @flexprice/flexprice-ui"
```

---

## Task 4: Repoint the dashboard's customer portal and delete the old widgets

**Files:**
- Modify: `src/components/customer-portal/TabRenderer.tsx`
- Delete: `src/components/customer-portal/widgets/WalletBalanceWidget.tsx`
- Delete: `src/components/customer-portal/widgets/WalletTransactionsWidget.tsx`

**Interfaces:**
- Consumes: `CreditBalanceContainer`, `CreditHistoryContainer` from `@/credits/containers/*` (Tasks 1–3).

- [ ] **Step 1: Rewrite `src/components/customer-portal/TabRenderer.tsx`**

```tsx
// src/components/customer-portal/TabRenderer.tsx
import { lazy, Suspense } from 'react';
import { TabConfig, UsageGraphConfig } from '@/types/dto/PortalConfig';
import { DashboardAnalyticsRequest } from '@/types';
import { SubscriptionResponse } from '@/types/dto/Subscription';
import { CustomerUsage } from '@/models';
import { Loader } from '@/components/atoms';

// Lazy-load widgets — unused widgets don't bloat the bundle.
const SubscriptionsWidget = lazy(() => import('./widgets/SubscriptionsWidget'));
const UsageQuotaContainer = lazy(() => import('@/usage/containers/UsageQuotaContainer'));
const UsageTrendChartContainer = lazy(() => import('@/usage/containers/UsageTrendChartContainer'));
const UsageBreakdownContainer = lazy(() => import('@/usage/containers/UsageBreakdownContainer'));
const InvoicesWidget = lazy(() => import('./widgets/InvoicesWidget'));
const CreditBalanceContainer = lazy(() => import('@/credits/containers/CreditBalanceContainer'));
const CreditHistoryContainer = lazy(() => import('@/credits/containers/CreditHistoryContainer'));
const MetricCardsContainer = lazy(() => import('@/usage/containers/MetricCardsContainer'));

const FallbackLoader = () => (
	<div className='py-12'>
		<Loader />
	</div>
);

const DEFAULT_USAGE_GRAPH_CONFIG: UsageGraphConfig = {
	date_presets: ['last_7_days', 'last_30_days'],
	default_preset: 'last_7_days',
	allow_custom_date_range: false,
	feature_filter_mode: 'all',
};

interface TabRendererProps {
	tab: TabConfig;
	subscriptions?: SubscriptionResponse[];
	usageData?: CustomerUsage[];
	/**
	 * Resolved analytics params from SectionContent.
	 * Shared across all analytics widgets (metric_cards, usage_graph)
	 * so they hit the same React Query cache entry — zero duplicate API calls.
	 */
	analyticsParams: DashboardAnalyticsRequest;
}

/**
 * Maps tab.type to the correct lazily-loaded widget.
 * analyticsParams is always passed from SectionContent (which owns the date filter state).
 */
const TabRenderer = ({ tab, subscriptions = [], usageData = [], analyticsParams }: TabRendererProps) => {
	return (
		<Suspense fallback={<FallbackLoader />}>
			{tab.type === 'subscriptions' && <SubscriptionsWidget subscriptions={subscriptions} label={tab.label} />}
			{tab.type === 'current_usage' && <UsageQuotaContainer usageData={usageData} label={tab.label} />}
			{tab.type === 'usage_graph' && (
				<UsageTrendChartContainer
					config={tab.usage_graph ?? DEFAULT_USAGE_GRAPH_CONFIG}
					analyticsParams={analyticsParams}
					label={tab.label}
				/>
			)}
			{tab.type === 'usage_breakdown' && <UsageBreakdownContainer analyticsParams={analyticsParams} label={tab.label} />}
			{tab.type === 'invoices' && <InvoicesWidget />}
			{tab.type === 'wallet_balance' && <CreditBalanceContainer />}
			{tab.type === 'wallet_transactions' && <CreditHistoryContainer />}
			{tab.type === 'metric_cards' && <MetricCardsContainer analyticsParams={analyticsParams} config={tab.metric_cards} />}
		</Suspense>
	);
};

export default TabRenderer;
```

Note: `CreditBalanceContainer`/`CreditHistoryContainer` take no `label`/`usageData`-style props from `TabRenderer` — unlike `UsageQuotaContainer`, the old `WalletBalanceWidget`/`WalletTransactionsWidget` never accepted a `label` override or pre-fetched data from `SectionContent`/`TabRenderer` (re-check the diff before this plan's Task 4 confirms `tab.label` was never passed to them in the pre-existing code — it wasn't; only `usage_graph`/`usage_breakdown`/`current_usage`/`metric_cards` tabs use `tab.label`). Don't invent a `label` prop that didn't exist before.

- [ ] **Step 2: Delete the superseded widget files**

```bash
git rm src/components/customer-portal/widgets/WalletBalanceWidget.tsx
git rm src/components/customer-portal/widgets/WalletTransactionsWidget.tsx
```

- [ ] **Step 3: Confirm nothing else references the deleted files**

Run: `grep -rln "widgets/WalletBalanceWidget\|widgets/WalletTransactionsWidget" src --include="*.tsx" --include="*.ts"`
Expected: no output

- [ ] **Step 4: Typecheck, lint, and run the full customer-portal + credits test suites**

Run: `npx tsc -b && npx eslint src/components/customer-portal src/credits && npx vitest run src/components/customer-portal src/credits`
Expected: no type errors, no lint errors, all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/customer-portal/TabRenderer.tsx
git commit -m "refactor(customer-portal): repoint TabRenderer at the exportable credits containers"
```

---

## Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build && npm run build:ui`
Expected: both succeed with zero TypeScript errors

- [ ] **Step 2: Full lint**

Run: `npx eslint src/ vite.config.ts vitest.config.ts .storybook`
Expected: zero errors

- [ ] **Step 3: Full test suite**

Run: `npx vitest run`
Expected: all tests PASS (including everything from the usage-widgets plan — confirms nothing regressed)

- [ ] **Step 4: Manual smoke check of the customer portal**

Start the dev server (`npm run dev`), open a customer portal URL with a `credits` section enabled (`wallet_balance`, `wallet_transactions` tabs), and confirm both render with live data, matching the pre-refactor visual appearance. If this sandbox has no live backend/auth available (as was the case for the usage-widgets plan), explicitly say so rather than skipping silently, and flag it as an open item for the human before merging.

- [ ] **Step 5: Commit (only if Step 4 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in exportable credits widgets smoke test"
```
