# Exportable Usage Widgets (`src/usage/`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export `UsageQuota`, `MetricCards`, `UsageTrendChart`, and `UsageBreakdown` from `@flexprice/flexprice-ui`, replacing the dashboard's self-fetching `widgets/*.tsx` with a presentational/container split so there is exactly one implementation of each.

**Architecture:** New `src/usage/` feature directory mirrors `src/pricing/`'s shape (`types.ts` / `schema.ts` / `i18n.ts` / `adapters.ts` / `lib.ts` / `components/` / `containers/`). Presentational components in `components/` are exported (prop-only, Tailwind classes bound to the package's existing `--fp-*` tokens, no `PortalConfigContext`); containers in `containers/` are dashboard-only (own the `useQuery`/`CustomerPortalApi` calls + adapters) and are never exported. `TabRenderer.tsx` is repointed from the old `widgets/*.tsx` to the new containers, and the old widgets are deleted.

**Tech Stack:** React 18, TypeScript, TanStack Query, Zod, Vitest + Testing Library, existing `@/lib/exportable/{validation,bundledI18n}` primitives.

## Global Constraints

- No `any` — use Zod schemas for runtime validation (`AGENTS.md`).
- Tailwind utility classes only, bound to the existing `--fp-*` token set (`bg-surface`, `text-content`, `text-content-secondary`, `text-content-tertiary`, `border-line`, etc. — all already defined in `tailwind.config.js` and scoped under `.flexprice-ui` in `src/exportable/styles.css`). No inline `style={{ backgroundColor: 'var(...)' }}`, no `--portal-*`, no `PortalConfigContext` dependency in anything under `src/usage/`.
- All server interactions via TanStack Query; never inline API calls in a presentational component (`AGENTS.md`).
- Tests co-located: `*.test.ts` for pure modules (adapters, schema), `*.test.tsx` for components. Use `@testing-library/react`.
- `npm run build:ui`, `npx tsc -b`, and `npx eslint src/` must pass with zero errors before this ships.
- Every exported component runs `normalize*()` on its own props as a defensive safety net (mirrors `PricingTable`/`PricingCard`); adapters are the authoritative validation/transformation boundary for the internal dashboard path and never touch React.
- `lib.ts` exports only component names — never a `*Container`.

---

## Task 1: `UsageQuota`

**Files:**
- Create: `src/usage/types.ts`
- Create: `src/usage/schema.ts`
- Create: `src/usage/i18n.ts`
- Create: `src/usage/adapters.ts`
- Create: `src/usage/components/UsageQuota.tsx`
- Create: `src/usage/containers/UsageQuotaContainer.tsx`
- Test: `src/usage/adapters.test.ts`
- Test: `src/usage/schema.test.ts`
- Test: `src/usage/components/UsageQuota.test.tsx`

**Interfaces:**
- Produces: `UsageQuotaItem { id: string; name: string; currentUsage: number; limit: number | null; isUnlimited: boolean }`, `UsageQuotaProps { items: UsageQuotaItem[]; label?: string; className?: string }` (from `types.ts`); `adaptUsageQuotaItems(usageData: CustomerUsage[]): UsageQuotaItem[]` (from `adapters.ts`); `normalizeUsageQuotaItems(input: unknown, onValidationError?): UsageQuotaItem[]` (from `schema.ts`); `useUsageT(): TFunction<'common'>` (from `i18n.ts`); default export `UsageQuota` (component) and `UsageQuotaContainer` (container).

- [ ] **Step 1: Write the failing adapter test**

```ts
// src/usage/adapters.test.ts
import { describe, it, expect } from 'vitest';
import { FEATURE_TYPE } from '@/models/Feature';
import { adaptUsageQuotaItems } from './adapters';

describe('adaptUsageQuotaItems', () => {
	it('keeps only metered entitlements and maps limit/unlimited', () => {
		const result = adaptUsageQuotaItems([
			{
				id: 'ent_1',
				feature: { id: 'feat_1', name: 'API Calls', type: FEATURE_TYPE.METERED },
				total_limit: 1000,
				is_unlimited: false,
				current_usage: 250,
				usage_percent: 25,
				is_enabled: true,
				is_soft_limit: false,
				next_usage_reset_at: null,
				sources: [],
			},
			{
				id: 'ent_2',
				feature: { id: 'feat_2', name: 'Seats', type: FEATURE_TYPE.STATIC },
				total_limit: null,
				is_unlimited: false,
				current_usage: 0,
				usage_percent: 0,
				is_enabled: true,
				is_soft_limit: false,
				next_usage_reset_at: null,
				sources: [],
			},
			{
				id: 'ent_3',
				feature: { id: 'feat_3', name: 'Storage', type: FEATURE_TYPE.METERED },
				total_limit: null,
				is_unlimited: true,
				current_usage: 42,
				usage_percent: 0,
				is_enabled: true,
				is_soft_limit: false,
				next_usage_reset_at: null,
				sources: [],
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		] as any);

		expect(result).toEqual([
			{ id: 'feat_1', name: 'API Calls', currentUsage: 250, limit: 1000, isUnlimited: false },
			{ id: 'feat_3', name: 'Storage', currentUsage: 42, limit: null, isUnlimited: true },
		]);
	});

	it('returns [] for empty/undefined input', () => {
		expect(adaptUsageQuotaItems([])).toEqual([]);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptUsageQuotaItems(undefined as any)).toEqual([]);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: FAIL — `Cannot find module './adapters'`

- [ ] **Step 3: Create `src/usage/types.ts`**

```ts
// src/usage/types.ts
//
// Public presentational types for the usage widgets (quota, metric cards, trend chart, breakdown).
//
// Decoupled from backend DTOs (CustomerUsage / DashboardAnalyticsRequest / UsageAnalyticItem /
// GetDetailedCostAnalyticsResponse). Containers map API responses INTO these shapes via
// `adapters.ts`, so backend schema changes never leak into the widgets' public contract.

// ── UsageQuota ──────────────────────────────────────────────────────────────

export interface UsageQuotaItem {
	id: string;
	name: string;
	currentUsage: number;
	limit: number | null;
	isUnlimited: boolean;
}

export interface UsageQuotaProps {
	items: UsageQuotaItem[];
	label?: string;
	className?: string;
}
```

- [ ] **Step 4: Create `src/usage/adapters.ts`**

```ts
// src/usage/adapters.ts
//
// Pure DTO → presentational mapping for the usage widgets. No React, no hooks — independently
// unit-testable. Containers call these to turn API responses into the usage widgets' typed
// presentational models. Mirrors `src/pricing/adapters.ts`.
import { FEATURE_TYPE } from '@/models/Feature';
import type { CustomerUsage } from '@/models';
import type { UsageQuotaItem } from './types';

/** Metered-usage entitlements only — static/boolean entitlements have no quota to show. */
export function adaptUsageQuotaItems(usageData: CustomerUsage[]): UsageQuotaItem[] {
	return (usageData ?? [])
		.filter((item) => item.feature?.type === FEATURE_TYPE.METERED)
		.map((item, index) => ({
			id: item.feature?.id || String(index),
			name: item.feature?.name || '',
			currentUsage: Number(item.current_usage || 0),
			limit: item.is_unlimited ? null : item.total_limit != null ? Number(item.total_limit) : null,
			isUnlimited: item.is_unlimited,
		}));
}
```

- [ ] **Step 5: Run the adapter test again**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Write the failing schema test**

```ts
// src/usage/schema.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeUsageQuotaItems } from './schema';

describe('normalizeUsageQuotaItems', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'f1', name: 'API Calls', currentUsage: 10, limit: 100, isUnlimited: false }];
		expect(normalizeUsageQuotaItems(input)).toEqual(input);
	});

	it('drops non-array input and reports via onValidationError', () => {
		const issues: unknown[] = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageQuotaItems('not-an-array' as any, (issue) => issues.push(issue));
		expect(result).toEqual([]);
		expect(issues.length).toBe(1);
	});

	it('coerces malformed numeric fields instead of throwing', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageQuotaItems([{ id: 'f1', name: 'X', currentUsage: 'oops', limit: null, isUnlimited: 'yes' }] as any);
		expect(result).toEqual([{ id: 'f1', name: 'X', currentUsage: 0, limit: null, isUnlimited: true }]);
	});
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: FAIL — `Cannot find module './schema'`

- [ ] **Step 8: Create `src/usage/schema.ts`**

```ts
// src/usage/schema.ts
//
// Runtime validation / normalization boundary for the usage widgets.
//
// WHY: containers feed trusted, adapter-produced data, but external SDK consumers pass raw props
// from their own code/API. TypeScript disappears at runtime, so a JS consumer — or a TS one using
// `as any` — can hand us the wrong shape. Rather than crash (white screen), we coerce what we can
// and surface issues via `onValidationError`. Mirrors `src/pricing/schema.ts`.
import { z } from 'zod';
import { createNormalizer, type NormalizerIssue } from '@/lib/exportable/validation';
import type { UsageQuotaItem } from './types';

const nullishToString = z.preprocess((v) => (v == null ? '' : v), z.coerce.string()).catch('');

function devWarn(label: string) {
	return (issue: NormalizerIssue) => {
		if (import.meta.env?.DEV) console.warn(`[@flexprice/flexprice-ui] invalid ${label} dropped/normalized:`, issue);
	};
}

// ── UsageQuota ──────────────────────────────────────────────────────────────

export const UsageQuotaItemSchema = z
	.object({
		id: nullishToString,
		name: nullishToString,
		currentUsage: z.coerce.number().catch(0),
		limit: z.coerce.number().nullable().catch(null),
		isUnlimited: z.coerce.boolean().catch(false),
	})
	.passthrough();

const usageQuotaNormalizer = createNormalizer<UsageQuotaItem>(UsageQuotaItemSchema);

export function normalizeUsageQuotaItems(input: unknown, onValidationError?: (issue: NormalizerIssue) => void): UsageQuotaItem[] {
	return usageQuotaNormalizer.normalizeMany(input, onValidationError ?? devWarn('usage quota item'));
}
```

- [ ] **Step 9: Run the schema test again**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 10: Create `src/usage/i18n.ts`**

```ts
// src/usage/i18n.ts
//
// Bundled i18n so the usage widgets render real English out-of-the-box for external consumers —
// WITHOUT overriding a host app that has its own i18n (the dashboard localizes these to Arabic).
// Mirrors `src/pricing/i18n.ts`. Namespace stays `'common'` so a host dashboard's own `common`
// bundle is reused for the handoff check; the bundled English defaults live under
// `common.usageWidgets`.
import { createBundledT } from '@/lib/exportable/bundledI18n';

/** English defaults for the keys the usage widgets render (mirror of dashboard `customer-portal.usage` / `usageBreakdown` / `metrics`). Extended by later tasks. */
const EN_USAGE_WIDGETS = {
	quotaTitle: 'Usage Quota',
	unknownFeature: 'Unknown Feature',
	unlimited: 'Unlimited',
};

export const useUsageT = createBundledT('common', { usageWidgets: EN_USAGE_WIDGETS }).useBoundT;
```

- [ ] **Step 11: Write the failing component test**

```tsx
// src/usage/components/UsageQuota.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import UsageQuota from './UsageQuota';

describe('UsageQuota', () => {
	it('renders a row per item with usage / limit text', () => {
		render(
			<UsageQuota
				items={[
					{ id: 'f1', name: 'API Calls', currentUsage: 250, limit: 1000, isUnlimited: false },
					{ id: 'f2', name: 'Storage', currentUsage: 42, limit: null, isUnlimited: true },
				]}
			/>,
		);
		expect(screen.getByText('API Calls')).toBeInTheDocument();
		expect(screen.getByText('Storage')).toBeInTheDocument();
		expect(screen.getByText('Usage Quota')).toBeInTheDocument();
	});

	it('renders nothing for an empty item list', () => {
		const { container } = render(<UsageQuota items={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('honors a custom label', () => {
		render(<UsageQuota items={[{ id: 'f1', name: 'X', currentUsage: 1, limit: null, isUnlimited: true }]} label='My Usage' />);
		expect(screen.getByText('My Usage')).toBeInTheDocument();
	});
});
```

- [ ] **Step 12: Run it to verify it fails**

Run: `npx vitest run src/usage/components/UsageQuota.test.tsx`
Expected: FAIL — `Cannot find module './UsageQuota'`

- [ ] **Step 13: Create `src/usage/components/UsageQuota.tsx`**

```tsx
// src/usage/components/UsageQuota.tsx
import { useMemo } from 'react';
import { Card, Progress } from '@/components/atoms';
import { formatAmount } from '@/components/atoms/Input/Input';
import { cn } from '@/lib/utils';
import { useUsageT } from '../i18n';
import { normalizeUsageQuotaItems } from '../schema';
import type { UsageQuotaProps } from '../types';

/**
 * Prop-only usage-quota list — no fetching, no auth, no PortalConfigContext. Renders a progress
 * bar per metered entitlement. Consumers supply already-adapted `items` (see `adaptUsageQuotaItems`).
 */
const UsageQuota = ({ items: rawItems, label, className }: UsageQuotaProps) => {
	const items = useMemo(() => normalizeUsageQuotaItems(rawItems), [rawItems]);
	const t = useUsageT();

	if (items.length === 0) return null;

	return (
		<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
			<div className='p-6 border-b border-line'>
				<h3 className='text-base font-medium text-content'>{label || t('usageWidgets.quotaTitle')}</h3>
			</div>
			<div className='p-6 space-y-4'>
				{items.map((item) => {
					const percentage = item.limit ? Math.min(Math.ceil((item.currentUsage / item.limit) * 100), 100) : 0;
					const isOverLimit = !!item.limit && item.currentUsage > item.limit;
					return (
						<div key={item.id} className='space-y-2'>
							<div className='flex items-center justify-between'>
								<span className='text-sm text-content'>{item.name || t('usageWidgets.unknownFeature')}</span>
								<span className='text-sm text-content-secondary'>
									{formatAmount(item.currentUsage.toString())}
									{item.limit ? ` / ${formatAmount(item.limit.toString())}` : ` / ${t('usageWidgets.unlimited')}`}
								</span>
							</div>
							<Progress
								value={item.isUnlimited ? 0 : percentage}
								className='h-2'
								indicatorColor={isOverLimit ? 'bg-destructive' : undefined}
								backgroundColor={isOverLimit ? 'bg-destructive/10' : undefined}
							/>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default UsageQuota;
```

- [ ] **Step 14: Run the component test again**

Run: `npx vitest run src/usage/components/UsageQuota.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 15: Create the container (no test — thin wiring, covered by Task 6's TabRenderer integration)**

```tsx
// src/usage/containers/UsageQuotaContainer.tsx
//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `UsageQuota`.
import { useQuery } from '@tanstack/react-query';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { adaptUsageQuotaItems } from '../adapters';
import UsageQuota from '../components/UsageQuota';

interface UsageQuotaContainerProps {
	label?: string;
	className?: string;
}

const UsageQuotaContainer = ({ label, className }: UsageQuotaContainerProps) => {
	const { data } = useQuery({
		queryKey: ['portal-usage'],
		queryFn: () => CustomerPortalApi.getUsageSummary(),
	});

	const items = adaptUsageQuotaItems(data?.features ?? []);

	return <UsageQuota items={items} label={label} className={className} />;
};

export default UsageQuotaContainer;
```

- [ ] **Step 16: Commit**

```bash
git add src/usage/
git commit -m "feat(flexprice-ui): add exportable UsageQuota component"
```

---

## Task 2: `MetricCards`

**Files:**
- Modify: `src/usage/types.ts` — append `MetricCardItem` / `MetricCardsProps`
- Modify: `src/usage/schema.ts` — append `MetricCardItemSchema` / `normalizeMetricCardItems`
- Modify: `src/usage/i18n.ts` — extend `EN_USAGE_WIDGETS`
- Modify: `src/usage/adapters.ts` — append `adaptMetricCards`
- Create: `src/usage/components/MetricCards.tsx`
- Create: `src/usage/containers/MetricCardsContainer.tsx`
- Test: append to `src/usage/adapters.test.ts`, `src/usage/schema.test.ts`
- Test: `src/usage/components/MetricCards.test.tsx`

**Interfaces:**
- Consumes: `NormalizerIssue`, `devWarn`, `nullishToString` from `schema.ts` (Task 1); `createNormalizer` from `@/lib/exportable/validation`.
- Produces: `MetricCardItem { id: string; titleKey: 'revenue' | 'cost' | 'margin' | 'marginPercent' | 'cpm' | 'custom'; customLabel?: string; value: number; currency?: string; isPercent?: boolean; showChangeIndicator?: boolean; isNegative?: boolean }`, `MetricCardsProps { metrics: MetricCardItem[]; isLoading?: boolean; className?: string }`; `adaptMetricCards(costData: GetDetailedCostAnalyticsResponse | undefined, customItems: CustomAnalyticItem[], config: MetricCardsConfig): MetricCardItem[]`; `normalizeMetricCardItems`; default export `MetricCards`, `MetricCardsContainer`.

- [ ] **Step 1: Write the failing adapter test (append to `src/usage/adapters.test.ts`)**

```ts
// append to src/usage/adapters.test.ts
import { adaptMetricCards } from './adapters';

describe('adaptMetricCards', () => {
	const costData = {
		cost_analytics: [],
		total_revenue: '1000',
		total_cost: '400',
		margin: '600',
		margin_percent: '60',
		roi: '1.5',
		roi_percent: '150',
		currency: 'USD',
		start_time: '2026-01-01',
		end_time: '2026-01-31',
	};

	it('includes revenue + cost + margin cards when enabled', () => {
		const result = adaptMetricCards(costData, [], { show_custom_metrics: false, show_revenue_metric: true, show_cost_metrics: true });
		expect(result).toEqual([
			{ id: 'revenue', titleKey: 'revenue', value: 1000, currency: 'USD' },
			{ id: 'cost', titleKey: 'cost', value: 400, currency: 'USD' },
			{ id: 'margin', titleKey: 'margin', value: 600, currency: 'USD', showChangeIndicator: true, isNegative: false },
			{ id: 'margin-percent', titleKey: 'marginPercent', value: 60, isPercent: true, showChangeIndicator: true, isNegative: false },
		]);
	});

	it('maps the revenue-per-minute custom metric to the cpm title key with currency', () => {
		const result = adaptMetricCards(
			costData,
			[{ id: 'revenue-per-minute', name: 'revenue-per-minute', feature_name: 'Revenue per minute', value: '0.12', type: 'currency' }],
			{ show_custom_metrics: true, show_revenue_metric: false, show_cost_metrics: false },
		);
		expect(result).toEqual([{ id: 'revenue-per-minute', titleKey: 'cpm', customLabel: 'revenue-per-minute', value: 0.12, currency: 'USD' }]);
	});

	it('maps a plain custom metric to the custom title key with no currency', () => {
		const result = adaptMetricCards(costData, [{ id: 'active-calls', name: 'Active Calls', feature_name: 'Active Calls', value: '42', type: 'count' }], {
			show_custom_metrics: true,
			show_revenue_metric: false,
			show_cost_metrics: false,
		});
		expect(result).toEqual([{ id: 'active-calls', titleKey: 'custom', customLabel: 'Active Calls', value: 42, currency: undefined }]);
	});

	it('returns [] when nothing is enabled or costData is missing', () => {
		expect(adaptMetricCards(undefined, [], { show_custom_metrics: false, show_revenue_metric: true, show_cost_metrics: true })).toEqual([]);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: FAIL — `adaptMetricCards is not a function`

- [ ] **Step 3: Append `MetricCardItem` / `MetricCardsProps` to `src/usage/types.ts`**

```ts
// append to src/usage/types.ts

// ── MetricCards ──────────────────────────────────────────────────────────────

export interface MetricCardItem {
	id: string;
	titleKey: 'revenue' | 'cost' | 'margin' | 'marginPercent' | 'cpm' | 'custom';
	/** Only set when `titleKey` is `'custom'` — the item's own name from the API. */
	customLabel?: string;
	value: number;
	currency?: string;
	isPercent?: boolean;
	showChangeIndicator?: boolean;
	isNegative?: boolean;
}

export interface MetricCardsProps {
	metrics: MetricCardItem[];
	isLoading?: boolean;
	className?: string;
}
```

- [ ] **Step 4: Append `adaptMetricCards` to `src/usage/adapters.ts`**

```ts
// append to src/usage/adapters.ts
import type { GetDetailedCostAnalyticsResponse } from '@/types/dto/Cost';
import type { CustomAnalyticItem } from '@/types/dto/Events';
import type { MetricCardsConfig } from '@/types/dto/PortalConfig';
import type { MetricCardItem } from './types';

export function adaptMetricCards(
	costData: GetDetailedCostAnalyticsResponse | undefined,
	customItems: CustomAnalyticItem[],
	config: MetricCardsConfig,
): MetricCardItem[] {
	const items: MetricCardItem[] = [];
	const currency = costData?.currency ?? 'USD';

	if (config.show_revenue_metric && costData) {
		items.push({ id: 'revenue', titleKey: 'revenue', value: parseFloat(costData.total_revenue), currency });
	}
	if (config.show_cost_metrics && costData) {
		const margin = parseFloat(costData.margin);
		const marginPercent = parseFloat(costData.margin_percent);
		items.push({ id: 'cost', titleKey: 'cost', value: parseFloat(costData.total_cost), currency });
		items.push({ id: 'margin', titleKey: 'margin', value: margin, currency, showChangeIndicator: true, isNegative: margin < 0 });
		items.push({
			id: 'margin-percent',
			titleKey: 'marginPercent',
			value: marginPercent,
			isPercent: true,
			showChangeIndicator: true,
			isNegative: marginPercent < 0,
		});
	}
	if (config.show_custom_metrics) {
		for (const item of customItems ?? []) {
			const value = parseFloat(item.value);
			const isCpm = item.id === 'revenue-per-minute' || item.name === 'revenue-per-minute';
			items.push({
				id: item.id,
				titleKey: isCpm ? 'cpm' : 'custom',
				customLabel: item.name,
				value: isNaN(value) ? 0 : value,
				currency: isCpm ? currency : undefined,
			});
		}
	}
	return items;
}
```

- [ ] **Step 5: Run the adapter tests again**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 6: Write the failing schema test (append to `src/usage/schema.test.ts`)**

```ts
// append to src/usage/schema.test.ts
import { normalizeMetricCardItems } from './schema';

describe('normalizeMetricCardItems', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'revenue', titleKey: 'revenue' as const, value: 100, currency: 'USD' }];
		expect(normalizeMetricCardItems(input)).toEqual(input);
	});

	it('falls back an unknown titleKey to custom', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeMetricCardItems([{ id: 'x', titleKey: 'not-a-real-key', value: 5 }] as any);
		expect(result[0].titleKey).toBe('custom');
	});
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: FAIL — `normalizeMetricCardItems is not a function`

- [ ] **Step 8: Append `MetricCardItemSchema` / `normalizeMetricCardItems` to `src/usage/schema.ts`**

```ts
// append to src/usage/schema.ts
import type { MetricCardItem } from './types';

// ── MetricCards ──────────────────────────────────────────────────────────────

export const MetricCardItemSchema = z
	.object({
		id: nullishToString,
		titleKey: z.enum(['revenue', 'cost', 'margin', 'marginPercent', 'cpm', 'custom']).catch('custom'),
		customLabel: z.coerce.string().optional(),
		value: z.coerce.number().catch(0),
		currency: z.coerce.string().optional(),
		isPercent: z.coerce.boolean().optional(),
		showChangeIndicator: z.coerce.boolean().optional(),
		isNegative: z.coerce.boolean().optional(),
	})
	.passthrough();

const metricCardsNormalizer = createNormalizer<MetricCardItem>(MetricCardItemSchema);

export function normalizeMetricCardItems(input: unknown, onValidationError?: (issue: NormalizerIssue) => void): MetricCardItem[] {
	return metricCardsNormalizer.normalizeMany(input, onValidationError ?? devWarn('metric card item'));
}
```

(Note: `import type { MetricCardItem } from './types';` merges into the existing `import type { UsageQuotaItem } from './types';` line from Task 1 — end with a single `import type { UsageQuotaItem, MetricCardItem } from './types';`.)

- [ ] **Step 9: Run the schema tests again**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 10: Extend `EN_USAGE_WIDGETS` in `src/usage/i18n.ts`**

```ts
// replace EN_USAGE_WIDGETS in src/usage/i18n.ts
const EN_USAGE_WIDGETS = {
	quotaTitle: 'Usage Quota',
	unknownFeature: 'Unknown Feature',
	unlimited: 'Unlimited',
	revenue: 'Revenue',
	cost: 'Cost',
	margin: 'Margin',
	marginPercent: 'Margin %',
	cpm: 'CPM',
};
```

- [ ] **Step 11: Write the failing component test**

```tsx
// src/usage/components/MetricCards.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import MetricCards from './MetricCards';

describe('MetricCards', () => {
	it('renders a translated title per metric', () => {
		render(
			<MetricCards
				metrics={[
					{ id: 'revenue', titleKey: 'revenue', value: 1000, currency: 'USD' },
					{ id: 'active-calls', titleKey: 'custom', customLabel: 'Active Calls', value: 42 },
				]}
			/>,
		);
		expect(screen.getByText('Revenue')).toBeInTheDocument();
		expect(screen.getByText('Active Calls')).toBeInTheDocument();
	});

	it('renders loading skeletons when isLoading', () => {
		const { container } = render(<MetricCards metrics={[]} isLoading />);
		expect(container.querySelectorAll('[class*="animate-pulse"], .grid > div').length).toBeGreaterThan(0);
	});

	it('renders nothing when not loading and metrics is empty', () => {
		const { container } = render(<MetricCards metrics={[]} />);
		expect(container).toBeEmptyDOMElement();
	});
});
```

- [ ] **Step 12: Run it to verify it fails**

Run: `npx vitest run src/usage/components/MetricCards.test.tsx`
Expected: FAIL — `Cannot find module './MetricCards'`

- [ ] **Step 13: Create `src/usage/components/MetricCards.tsx`**

```tsx
// src/usage/components/MetricCards.tsx
import { useMemo } from 'react';
import { MetricCard } from '@/components/molecules';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useUsageT } from '../i18n';
import { normalizeMetricCardItems } from '../schema';
import type { MetricCardsProps } from '../types';

const TRANSLATED_TITLE_KEYS = new Set(['revenue', 'cost', 'margin', 'marginPercent', 'cpm']);

/**
 * Prop-only metric-card grid — no fetching, no auth, no PortalConfigContext. Renders one
 * `MetricCard` per entry (already token-based, no portal coupling). Consumers supply
 * already-adapted `metrics` (see `adaptMetricCards`).
 */
const MetricCards = ({ metrics: rawMetrics, isLoading = false, className }: MetricCardsProps) => {
	const metrics = useMemo(() => normalizeMetricCardItems(rawMetrics), [rawMetrics]);
	const t = useUsageT();

	if (isLoading) {
		return (
			<div className={cn('flexprice-ui', 'grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className='rounded-md p-[25px] space-y-3 bg-surface border border-line'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-7 w-32' />
					</div>
				))}
			</div>
		);
	}

	if (metrics.length === 0) return null;

	return (
		<div
			className={cn('flexprice-ui', 'grid gap-3', className)}
			style={{
				gridTemplateColumns: metrics.length === 1 ? 'auto' : `repeat(${metrics.length}, 1fr)`,
				width: metrics.length === 1 ? '25%' : '100%',
			}}>
			{metrics.map((item) => (
				<MetricCard
					key={item.id}
					title={TRANSLATED_TITLE_KEYS.has(item.titleKey) ? t(`usageWidgets.${item.titleKey}`) : item.customLabel || ''}
					value={item.value}
					currency={item.currency}
					isPercent={item.isPercent}
					showChangeIndicator={item.showChangeIndicator}
					isNegative={item.isNegative}
				/>
			))}
		</div>
	);
};

export default MetricCards;
```

- [ ] **Step 14: Run the component test again**

Run: `npx vitest run src/usage/components/MetricCards.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 15: Create the container**

```tsx
// src/usage/containers/MetricCardsContainer.tsx
//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `MetricCards`.
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import type { DashboardAnalyticsRequest } from '@/types';
import type { MetricCardsConfig } from '@/types/dto/PortalConfig';
import type { CustomAnalyticItem } from '@/types/dto/Events';
import { adaptMetricCards } from '../adapters';
import MetricCards from '../components/MetricCards';

const DEFAULT_CONFIG: MetricCardsConfig = { show_custom_metrics: true, show_revenue_metric: true, show_cost_metrics: true };

interface MetricCardsContainerProps {
	analyticsParams: DashboardAnalyticsRequest;
	config?: MetricCardsConfig;
	className?: string;
}

const MetricCardsContainer = ({ analyticsParams, config, className }: MetricCardsContainerProps) => {
	const { t } = useTranslation('customer-portal');
	const merged: MetricCardsConfig = { ...DEFAULT_CONFIG, ...config };

	const {
		data: analyticsData,
		isLoading: analyticsLoading,
		isError: analyticsError,
	} = useQuery({
		queryKey: ['portal-analytics', analyticsParams],
		queryFn: () => CustomerPortalApi.getAnalytics(analyticsParams),
		enabled: merged.show_custom_metrics,
	});

	const {
		data: costData,
		isLoading: costLoading,
		isError: costError,
	} = useQuery({
		queryKey: ['portal-cost-analytics', analyticsParams.start_time, analyticsParams.end_time],
		queryFn: () =>
			CustomerPortalApi.getCostAnalytics({ start_time: analyticsParams.start_time, end_time: analyticsParams.end_time, expand: ['meter', 'price'] }),
		enabled: merged.show_revenue_metric || merged.show_cost_metrics,
	});

	useEffect(() => {
		if (analyticsError) toast.error(t('errors.loadAnalytics'));
	}, [analyticsError, t]);
	useEffect(() => {
		if (costError) toast.error(t('errors.loadCostAnalytics'));
	}, [costError, t]);

	const customItems: CustomAnalyticItem[] = analyticsData?.custom_analytics ?? [];
	const isLoading = (merged.show_custom_metrics && analyticsLoading) || ((merged.show_revenue_metric || merged.show_cost_metrics) && costLoading);
	const metrics = adaptMetricCards(costData, customItems, merged);

	return <MetricCards metrics={metrics} isLoading={isLoading} className={className} />;
};

export default MetricCardsContainer;
```

- [ ] **Step 16: Full usage test suite + typecheck**

Run: `npx vitest run src/usage/ && npx tsc -b`
Expected: All tests PASS, no type errors

- [ ] **Step 17: Commit**

```bash
git add src/usage/
git commit -m "feat(flexprice-ui): add exportable MetricCards component"
```

---

## Task 3: `UsageTrendChart`

**Files:**
- Create: `src/components/molecules/CustomerUsageChart.i18n.ts`
- Modify: `src/components/molecules/CustomerUsageChart.tsx:1-9,94-95` — swap raw `useTranslation` for the bundled hook
- Modify: `src/usage/types.ts` — append `UsageTrendPoint` / `UsageTrendSeries` / `UsageTrendChartProps`
- Modify: `src/usage/schema.ts` — append `UsageTrendSeriesSchema` / `normalizeUsageTrendSeries`
- Modify: `src/usage/i18n.ts` — extend `EN_USAGE_WIDGETS` with `trendTitle`
- Modify: `src/usage/adapters.ts` — append `adaptUsageTrendSeries`
- Create: `src/usage/components/UsageTrendChart.tsx`
- Create: `src/usage/containers/UsageTrendChartContainer.tsx`
- Test: append to `src/usage/adapters.test.ts`, `src/usage/schema.test.ts`
- Test: `src/usage/components/UsageTrendChart.test.tsx`

**Interfaces:**
- Produces: `UsageTrendPoint { timestamp: string; usage: number }`, `UsageTrendSeries { id: string; name: string; points: UsageTrendPoint[] }`, `UsageTrendChartProps { series: UsageTrendSeries[]; label?: string; isLoading?: boolean; className?: string }`; `adaptUsageTrendSeries(items: UsageAnalyticItem[], config: Pick<UsageGraphConfig, 'feature_filter_mode' | 'feature_ids'>): UsageTrendSeries[]`; `normalizeUsageTrendSeries`; default export `UsageTrendChart`, `UsageTrendChartContainer`; `useCustomerUsageChartT()` from the new `CustomerUsageChart.i18n.ts`.

- [ ] **Step 1: Write the failing adapter test (append to `src/usage/adapters.test.ts`)**

```ts
// append to src/usage/adapters.test.ts
import { adaptUsageTrendSeries } from './adapters';

describe('adaptUsageTrendSeries', () => {
	const items = [
		{ feature_id: 'feat_1', source: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10, cost: 1, event_count: 5 }] },
		{ feature_id: 'feat_2', source: 'feat_2', name: 'Storage', points: [] },
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	] as any;

	it('maps items to series with no filtering when mode is all', () => {
		const result = adaptUsageTrendSeries(items, { feature_filter_mode: 'all' });
		expect(result).toEqual([
			{ id: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10 }] },
			{ id: 'feat_2', name: 'Storage', points: [] },
		]);
	});

	it('applies an include_list filter', () => {
		const result = adaptUsageTrendSeries(items, { feature_filter_mode: 'include_list', feature_ids: ['feat_1'] });
		expect(result.map((s) => s.id)).toEqual(['feat_1']);
	});

	it('applies an exclude_list filter', () => {
		const result = adaptUsageTrendSeries(items, { feature_filter_mode: 'exclude_list', feature_ids: ['feat_1'] });
		expect(result.map((s) => s.id)).toEqual(['feat_2']);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: FAIL — `adaptUsageTrendSeries is not a function`

- [ ] **Step 3: Append `UsageTrendPoint` / `UsageTrendSeries` / `UsageTrendChartProps` to `src/usage/types.ts`**

```ts
// append to src/usage/types.ts

// ── UsageTrendChart ──────────────────────────────────────────────────────────

export interface UsageTrendPoint {
	timestamp: string;
	usage: number;
}

export interface UsageTrendSeries {
	id: string;
	name: string;
	points: UsageTrendPoint[];
}

export interface UsageTrendChartProps {
	series: UsageTrendSeries[];
	label?: string;
	isLoading?: boolean;
	className?: string;
}
```

- [ ] **Step 4: Append `adaptUsageTrendSeries` to `src/usage/adapters.ts`**

```ts
// append to src/usage/adapters.ts
import type { UsageAnalyticItem } from '@/models';
import type { UsageGraphConfig } from '@/types/dto/PortalConfig';
import type { UsageTrendSeries } from './types';

/** Applies the portal's feature_filter_mode config, then maps to the decoupled series shape. */
export function adaptUsageTrendSeries(
	items: UsageAnalyticItem[],
	config: Pick<UsageGraphConfig, 'feature_filter_mode' | 'feature_ids'>,
): UsageTrendSeries[] {
	const { feature_filter_mode, feature_ids } = config;
	let filtered = items ?? [];
	if (feature_filter_mode === 'include_list' && feature_ids?.length) {
		filtered = filtered.filter((item) => feature_ids.includes(item.feature_id));
	} else if (feature_filter_mode === 'exclude_list' && feature_ids?.length) {
		filtered = filtered.filter((item) => !feature_ids.includes(item.feature_id));
	}
	return filtered.map((item, index) => ({
		id: item.source || item.feature_id || `series-${index}`,
		name: item.name || item.event_name || '',
		points: (item.points ?? []).map((p) => ({ timestamp: p.timestamp, usage: p.usage })),
	}));
}
```

- [ ] **Step 5: Run the adapter tests again**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 6: Write the failing schema test (append to `src/usage/schema.test.ts`)**

```ts
// append to src/usage/schema.test.ts
import { normalizeUsageTrendSeries } from './schema';

describe('normalizeUsageTrendSeries', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10 }] }];
		expect(normalizeUsageTrendSeries(input)).toEqual(input);
	});

	it('defaults a missing points array to []', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageTrendSeries([{ id: 'feat_1', name: 'X' }] as any);
		expect(result[0].points).toEqual([]);
	});
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: FAIL — `normalizeUsageTrendSeries is not a function`

- [ ] **Step 8: Append `UsageTrendSeriesSchema` / `normalizeUsageTrendSeries` to `src/usage/schema.ts`**

```ts
// append to src/usage/schema.ts
import type { UsageTrendSeries } from './types';

// ── UsageTrendChart ──────────────────────────────────────────────────────────

const usageTrendPointSchema = z
	.object({
		timestamp: nullishToString,
		usage: z.coerce.number().catch(0),
	})
	.passthrough();

export const UsageTrendSeriesSchema = z
	.object({
		id: nullishToString,
		name: nullishToString,
		points: z
			.array(usageTrendPointSchema)
			.optional()
			.catch(() => [])
			.transform((v) => v ?? []),
	})
	.passthrough();

const usageTrendNormalizer = createNormalizer<UsageTrendSeries>(UsageTrendSeriesSchema);

export function normalizeUsageTrendSeries(input: unknown, onValidationError?: (issue: NormalizerIssue) => void): UsageTrendSeries[] {
	return usageTrendNormalizer.normalizeMany(input, onValidationError ?? devWarn('usage trend series'));
}
```

(Again, merge the `import type` line into the running `import type { UsageQuotaItem, MetricCardItem, UsageTrendSeries } from './types';` at the top of `schema.ts`.)

- [ ] **Step 9: Run the schema tests again**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 10: Extend `EN_USAGE_WIDGETS` in `src/usage/i18n.ts`**

```ts
// add to EN_USAGE_WIDGETS in src/usage/i18n.ts
	trendTitle: 'Usage Trend',
```

- [ ] **Step 11: Create `src/components/molecules/CustomerUsageChart.i18n.ts`**

```ts
// src/components/molecules/CustomerUsageChart.i18n.ts
//
// Bundled i18n so CustomerUsageChart renders real English out-of-the-box when reused by exportable
// components (e.g. @flexprice/flexprice-ui's UsageTrendChart) — WITHOUT overriding a host app that
// has its own i18n. Mirrors `src/pricing/i18n.ts`.
import { createBundledT } from '@/lib/exportable/bundledI18n';

const EN_CUSTOMER_CHARTS = {
	usageNoDataDescription: 'No usage data available',
	usageNoDataBody: 'No data to display',
	resetZoom: 'Reset zoom',
	selectingArea: 'Selecting area...',
	seriesFallback: 'Series {{index}}',
};

export const useCustomerUsageChartT = createBundledT('common', { customerCharts: EN_CUSTOMER_CHARTS }).useBoundT;
```

- [ ] **Step 12: Update `src/components/molecules/CustomerUsageChart.tsx` to use the bundled hook**

In the imports (around line 9), replace:

```ts
import { useTranslation } from 'react-i18next';
```

with:

```ts
import { useCustomerUsageChartT } from './CustomerUsageChart.i18n';
```

Then in the component body (around line 95), replace:

```ts
	const { t } = useTranslation('common');
```

with:

```ts
	const t = useCustomerUsageChartT();
```

This is behavior-preserving for every existing caller (`UsageAnalyticsTab`, `OverviewTab`, `UsageGraphWidget`, `CustomerAnalyticsTab`) — all run inside the authenticated dashboard where the host i18n already serves the `common` namespace, so `useCustomerUsageChartT()` returns the identical host `t`. It only changes behavior for a host with no i18next at all (the bundled English fallback now renders instead of raw translation keys).

- [ ] **Step 13: Confirm nothing broke**

Run: `npx vitest run src/components/molecules/ && npx tsc -b`
Expected: PASS, no type errors

- [ ] **Step 14: Write the failing component test**

```tsx
// src/usage/components/UsageTrendChart.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import UsageTrendChart from './UsageTrendChart';

describe('UsageTrendChart', () => {
	it('renders the chart title and passes series through to the chart', () => {
		render(
			<UsageTrendChart
				series={[{ id: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10 }] }]}
			/>,
		);
		expect(screen.getByText('Usage Trend')).toBeInTheDocument();
	});

	it('renders nothing when not loading and series is empty', () => {
		const { container } = render(<UsageTrendChart series={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders a loading skeleton when isLoading', () => {
		const { container } = render(<UsageTrendChart series={[]} isLoading />);
		expect(container.querySelector('.animate-pulse, [class*="skeleton"]')).not.toBeNull();
	});
});
```

- [ ] **Step 15: Run it to verify it fails**

Run: `npx vitest run src/usage/components/UsageTrendChart.test.tsx`
Expected: FAIL — `Cannot find module './UsageTrendChart'`

- [ ] **Step 16: Create `src/usage/components/UsageTrendChart.tsx`**

```tsx
// src/usage/components/UsageTrendChart.tsx
import { useMemo } from 'react';
import { Card } from '@/components/atoms';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerUsageChart } from '@/components/molecules';
import type { GetUsageAnalyticsResponse } from '@/types/dto';
import { cn } from '@/lib/utils';
import { useUsageT } from '../i18n';
import { normalizeUsageTrendSeries } from '../schema';
import type { UsageTrendChartProps } from '../types';

/**
 * Prop-only usage-trend line chart — no fetching, no auth, no PortalConfigContext. Internally
 * reuses the dashboard's `CustomerUsageChart` renderer (already token-based, no portal coupling);
 * this wrapper only adds the Card chrome and a decoupled `series` prop shape so the public
 * contract never leaks the `GetUsageAnalyticsResponse` backend DTO.
 */
const UsageTrendChart = ({ series: rawSeries, label, isLoading = false, className }: UsageTrendChartProps) => {
	const series = useMemo(() => normalizeUsageTrendSeries(rawSeries), [rawSeries]);
	const t = useUsageT();

	const chartData: GetUsageAnalyticsResponse = useMemo(
		() => ({
			total_cost: 0,
			currency: '',
			items: series.map((s) => ({
				feature_id: s.id,
				source: s.id,
				name: s.name,
				total_usage: 0,
				total_cost: 0,
				event_count: 0,
				points: s.points.map((p) => ({ timestamp: p.timestamp, usage: p.usage, cost: 0, event_count: 0 })),
			})),
		}),
		[series],
	);

	if (!isLoading && series.length === 0) return null;

	return (
		<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
			<div className='p-6 border-b border-line'>
				<h3 className='text-base font-medium text-content'>{label || t('usageWidgets.trendTitle')}</h3>
			</div>
			<div className='p-6'>
				{isLoading ? (
					<div className='w-full h-64 flex flex-col gap-3 px-1'>
						<div className='flex flex-col justify-between h-52 relative'>
							{[...Array(5)].map((_, i) => (
								<div key={i} className='flex items-center gap-3 w-full'>
									<Skeleton className='h-3 w-8 shrink-0' />
									<div className='flex-1 h-px bg-line' />
								</div>
							))}
							<div className='absolute bottom-0 left-12 right-0 flex items-end gap-3 h-40'>
								{[35, 65, 45, 80, 55, 90, 40, 70, 50, 60].map((h, i) => (
									<Skeleton key={i} className='flex-1 rounded-sm' style={{ height: `${h}%` }} />
								))}
							</div>
						</div>
						<div className='flex justify-between ps-12'>
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} className='h-3 w-12' />
							))}
						</div>
					</div>
				) : (
					<CustomerUsageChart data={chartData} />
				)}
			</div>
		</Card>
	);
};

export default UsageTrendChart;
```

- [ ] **Step 17: Run the component test again**

Run: `npx vitest run src/usage/components/UsageTrendChart.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 18: Create the container**

```tsx
// src/usage/containers/UsageTrendChartContainer.tsx
//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `UsageTrendChart`.
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import type { DashboardAnalyticsRequest } from '@/types';
import type { UsageGraphConfig } from '@/types/dto/PortalConfig';
import { adaptUsageTrendSeries } from '../adapters';
import UsageTrendChart from '../components/UsageTrendChart';

interface UsageTrendChartContainerProps {
	config: UsageGraphConfig;
	analyticsParams: DashboardAnalyticsRequest;
	label?: string;
	className?: string;
}

const UsageTrendChartContainer = ({ config, analyticsParams, label, className }: UsageTrendChartContainerProps) => {
	const { t } = useTranslation('customer-portal');
	const {
		data: analyticsData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['portal-analytics', analyticsParams],
		queryFn: () => CustomerPortalApi.getAnalytics(analyticsParams),
	});

	useEffect(() => {
		if (isError) toast.error(t('errors.loadUsageAnalytics'));
	}, [isError, t]);

	const series = adaptUsageTrendSeries(analyticsData?.items ?? [], config);

	return <UsageTrendChart series={series} label={label} isLoading={isLoading} className={className} />;
};

export default UsageTrendChartContainer;
```

- [ ] **Step 19: Full usage test suite + typecheck**

Run: `npx vitest run src/usage/ src/components/molecules/CustomerUsageChart* && npx tsc -b`
Expected: All tests PASS, no type errors

- [ ] **Step 20: Commit**

```bash
git add src/usage/ src/components/molecules/CustomerUsageChart.tsx src/components/molecules/CustomerUsageChart.i18n.ts
git commit -m "feat(flexprice-ui): add exportable UsageTrendChart component"
```

---

## Task 4: `UsageBreakdown`

**Files:**
- Modify: `src/usage/types.ts` — append `UsageBreakdownRow` / `UsageBreakdownProps`
- Modify: `src/usage/schema.ts` — append `UsageBreakdownRowSchema` / `normalizeUsageBreakdownRows`
- Modify: `src/usage/i18n.ts` — extend `EN_USAGE_WIDGETS` with the breakdown-table keys
- Modify: `src/usage/adapters.ts` — append `adaptUsageBreakdownRows`
- Create: `src/usage/components/UsageBreakdown.tsx`
- Create: `src/usage/containers/UsageBreakdownContainer.tsx`
- Test: append to `src/usage/adapters.test.ts`, `src/usage/schema.test.ts`
- Test: `src/usage/components/UsageBreakdown.test.tsx`

**Interfaces:**
- Produces: `UsageBreakdownRow { id: string; name: string; groupId?: string; groupName?: string; totalUsage: number; totalUsageDisplay?: string; unit?: string; totalCost: number; currency?: string }`, `UsageBreakdownProps { rows: UsageBreakdownRow[]; label?: string; isLoading?: boolean; className?: string }`; `adaptUsageBreakdownRows(items: UsageAnalyticItem[]): UsageBreakdownRow[]`; `normalizeUsageBreakdownRows`; default export `UsageBreakdown`, `UsageBreakdownContainer`.

- [ ] **Step 1: Write the failing adapter test (append to `src/usage/adapters.test.ts`)**

```ts
// append to src/usage/adapters.test.ts
import { adaptUsageBreakdownRows } from './adapters';

describe('adaptUsageBreakdownRows', () => {
	it('maps group, usage display, and cost fields', () => {
		const result = adaptUsageBreakdownRows([
			{
				feature_id: 'feat_1',
				name: 'API Calls',
				group: { id: 'grp_1', name: 'Core' },
				total_usage: 1234,
				total_usage_display: '1,234',
				unit: 'call',
				unit_plural: 'calls',
				total_cost: 12.5,
				currency: 'USD',
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		] as any);
		expect(result).toEqual([
			{
				id: 'feat_1',
				name: 'API Calls',
				groupId: 'grp_1',
				groupName: 'Core',
				totalUsage: 1234,
				totalUsageDisplay: '1,234',
				unit: 'calls',
				totalCost: 12.5,
				currency: 'USD',
			},
		]);
	});

	it('leaves group fields undefined when the row has no group', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = adaptUsageBreakdownRows([{ feature_id: 'feat_2', name: 'Storage', total_usage: 0, total_cost: 0 }] as any);
		expect(result[0].groupId).toBeUndefined();
		expect(result[0].groupName).toBeUndefined();
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: FAIL — `adaptUsageBreakdownRows is not a function`

- [ ] **Step 3: Append `UsageBreakdownRow` / `UsageBreakdownProps` to `src/usage/types.ts`**

```ts
// append to src/usage/types.ts

// ── UsageBreakdown ──────────────────────────────────────────────────────────

export interface UsageBreakdownRow {
	id: string;
	name: string;
	groupId?: string;
	groupName?: string;
	totalUsage: number;
	totalUsageDisplay?: string;
	unit?: string;
	totalCost: number;
	currency?: string;
}

export interface UsageBreakdownProps {
	rows: UsageBreakdownRow[];
	label?: string;
	isLoading?: boolean;
	className?: string;
}
```

- [ ] **Step 4: Append `adaptUsageBreakdownRows` to `src/usage/adapters.ts`**

```ts
// append to src/usage/adapters.ts
import type { UsageBreakdownRow } from './types';

export function adaptUsageBreakdownRows(items: UsageAnalyticItem[]): UsageBreakdownRow[] {
	return (items ?? []).map((row, index) => {
		const group = row.group ?? row.feature?.group ?? row.price?.group;
		const unitLabel = row.reporting_unit
			? Number(row.total_usage) === 1
				? (row.reporting_unit.unit_singular ?? row.reporting_unit.unit_plural ?? '')
				: (row.reporting_unit.unit_plural ?? row.reporting_unit.unit_singular ?? '')
			: row.unit
				? Number(row.total_usage) === 1
					? row.unit
					: (row.unit_plural ?? row.unit)
				: undefined;
		return {
			id: row.feature_id || row.price_id || row.meter_id || String(index),
			name: row.name || row.feature?.name || row.event_name || '',
			groupId: group?.id,
			groupName: group?.name,
			totalUsage: Number(row.total_usage) || 0,
			totalUsageDisplay: row.total_usage_display || undefined,
			unit: unitLabel,
			totalCost: Number(row.total_cost) || 0,
			currency: row.currency,
		};
	});
}
```

- [ ] **Step 5: Run the adapter tests again**

Run: `npx vitest run src/usage/adapters.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 6: Write the failing schema test (append to `src/usage/schema.test.ts`)**

```ts
// append to src/usage/schema.test.ts
import { normalizeUsageBreakdownRows } from './schema';

describe('normalizeUsageBreakdownRows', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'feat_1', name: 'API Calls', totalUsage: 10, totalCost: 5 }];
		expect(normalizeUsageBreakdownRows(input)).toEqual(input);
	});

	it('coerces non-numeric usage/cost to 0 instead of throwing', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageBreakdownRows([{ id: 'feat_1', name: 'X', totalUsage: 'oops', totalCost: null }] as any);
		expect(result[0].totalUsage).toBe(0);
		expect(result[0].totalCost).toBe(0);
	});
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: FAIL — `normalizeUsageBreakdownRows is not a function`

- [ ] **Step 8: Append `UsageBreakdownRowSchema` / `normalizeUsageBreakdownRows` to `src/usage/schema.ts`**

```ts
// append to src/usage/schema.ts
import type { UsageBreakdownRow } from './types';

// ── UsageBreakdown ──────────────────────────────────────────────────────────

export const UsageBreakdownRowSchema = z
	.object({
		id: nullishToString,
		name: nullishToString,
		groupId: z.coerce.string().optional(),
		groupName: z.coerce.string().optional(),
		totalUsage: z.coerce.number().catch(0),
		totalUsageDisplay: z.coerce.string().optional(),
		unit: z.coerce.string().optional(),
		totalCost: z.coerce.number().catch(0),
		currency: z.coerce.string().optional(),
	})
	.passthrough();

const usageBreakdownNormalizer = createNormalizer<UsageBreakdownRow>(UsageBreakdownRowSchema);

export function normalizeUsageBreakdownRows(input: unknown, onValidationError?: (issue: NormalizerIssue) => void): UsageBreakdownRow[] {
	return usageBreakdownNormalizer.normalizeMany(input, onValidationError ?? devWarn('usage breakdown row'));
}
```

- [ ] **Step 9: Run the schema tests again**

Run: `npx vitest run src/usage/schema.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 10: Extend `EN_USAGE_WIDGETS` in `src/usage/i18n.ts`**

```ts
// add to EN_USAGE_WIDGETS in src/usage/i18n.ts
	breakdownTitle: 'Usage Breakdown',
	feature: 'Feature',
	totalUsage: 'Total Usage',
	totalCost: 'Total Cost',
	noGroup: 'No group',
	expandAllAria: 'Expand all',
	collapseAllAria: 'Collapse all',
	unknownRow: 'Unknown',
	cellEmDash: '—',
	cellEmpty: '--',
```

- [ ] **Step 11: Write the failing component test**

```tsx
// src/usage/components/UsageBreakdown.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import UsageBreakdown from './UsageBreakdown';

const ROWS = [
	{ id: 'feat_1', name: 'API Calls', groupId: 'grp_1', groupName: 'Core', totalUsage: 1000, totalCost: 12, currency: 'USD' },
	{ id: 'feat_2', name: 'Storage', totalUsage: 50, totalCost: 0 },
];

describe('UsageBreakdown', () => {
	it('renders grouped and ungrouped rows with the title', () => {
		render(<UsageBreakdown rows={ROWS} />);
		expect(screen.getByText('Usage Breakdown')).toBeInTheDocument();
		expect(screen.getByText('Core')).toBeInTheDocument();
		expect(screen.getByText('Storage')).toBeInTheDocument();
	});

	it('renders nothing when not loading and rows is empty', () => {
		const { container } = render(<UsageBreakdown rows={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders a loading skeleton when isLoading', () => {
		const { container } = render(<UsageBreakdown rows={[]} isLoading />);
		expect(container.querySelector('.animate-pulse')).not.toBeNull();
	});
});
```

- [ ] **Step 12: Run it to verify it fails**

Run: `npx vitest run src/usage/components/UsageBreakdown.test.tsx`
Expected: FAIL — `Cannot find module './UsageBreakdown'`

- [ ] **Step 13: Create `src/usage/components/UsageBreakdown.tsx`**

```tsx
// src/usage/components/UsageBreakdown.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Card } from '@/components/atoms';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/molecules/Table/Table';
import { formatNumber, getCurrencySymbol } from '@/utils';
import { cn } from '@/lib/utils';
import { useUsageT } from '../i18n';
import { normalizeUsageBreakdownRows } from '../schema';
import type { UsageBreakdownProps, UsageBreakdownRow } from '../types';

const SORT_TOTAL_USAGE = 'totalUsage' as const;
const SORT_TOTAL_COST = 'totalCost' as const;
const UNGROUPED_KEY = '__ungrouped__';

interface GroupBucket {
	groupKey: string;
	groupName: string;
	items: UsageBreakdownRow[];
}

function renderUsageCell(row: UsageBreakdownRow) {
	const useDisplayValue = row.totalUsageDisplay != null && row.totalUsageDisplay !== '';
	const displayNum = useDisplayValue ? Number(parseFloat(row.totalUsageDisplay!.replace(/,/g, ''))) : row.totalUsage;
	const formatted = useDisplayValue ? formatNumber(displayNum, displayNum % 1 === 0 ? 0 : 2) : formatNumber(row.totalUsage);
	return (
		<span>
			{formatted}
			{row.unit ? ` ${row.unit}` : ''}
		</span>
	);
}

function renderCostCell(row: UsageBreakdownRow) {
	if (row.totalCost === 0 || !row.currency) return '-';
	return (
		<span>
			{getCurrencySymbol(row.currency)}
			{formatNumber(row.totalCost, 2)}
		</span>
	);
}

/**
 * Prop-only usage-breakdown table — no fetching, no auth, no PortalConfigContext. Groups rows by
 * `groupId`/`groupName` (falls back to an "ungrouped" bucket) and supports sorting by usage/cost.
 */
const UsageBreakdown = ({ rows: rawRows, label, isLoading = false, className }: UsageBreakdownProps) => {
	const rows = useMemo(() => normalizeUsageBreakdownRows(rawRows), [rawRows]);
	const t = useUsageT();

	const [sortField, setSortField] = useState<typeof SORT_TOTAL_USAGE | typeof SORT_TOTAL_COST>(SORT_TOTAL_COST);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
	const hasInitializedExpand = useRef(false);

	const sortedRows = useMemo(() => {
		const sorted = [...rows];
		const mult = sortDirection === 'asc' ? 1 : -1;
		sorted.sort((a, b) => (a[sortField] - b[sortField]) * mult);
		return sorted;
	}, [rows, sortDirection, sortField]);

	const { groupedBuckets, ungroupedItems } = useMemo(() => {
		const map = new Map<string, GroupBucket>();
		for (const row of sortedRows) {
			const groupKey = row.groupId ?? UNGROUPED_KEY;
			const groupName = row.groupName ?? t('usageWidgets.noGroup');
			if (!map.has(groupKey)) map.set(groupKey, { groupKey, groupName, items: [] });
			map.get(groupKey)!.items.push(row);
		}
		const ungrouped = map.get(UNGROUPED_KEY)?.items ?? [];
		const grouped = Array.from(map.values())
			.filter((b) => b.groupKey !== UNGROUPED_KEY)
			.sort((a, b) => a.groupName.localeCompare(b.groupName));
		return { groupedBuckets: grouped, ungroupedItems: ungrouped };
	}, [sortedRows, t]);

	useEffect(() => {
		if (groupedBuckets.length > 0 && !hasInitializedExpand.current) {
			hasInitializedExpand.current = true;
			setExpandedGroupIds(new Set(groupedBuckets.map((b) => b.groupKey)));
		}
	}, [groupedBuckets]);

	const hasGroups = groupedBuckets.length > 0;
	const allExpanded = hasGroups && groupedBuckets.every((b) => expandedGroupIds.has(b.groupKey));
	const toggleExpandAll = () => setExpandedGroupIds(allExpanded ? new Set() : new Set(groupedBuckets.map((b) => b.groupKey)));
	const toggleGroup = (groupKey: string) =>
		setExpandedGroupIds((prev) => {
			const next = new Set(prev);
			if (next.has(groupKey)) next.delete(groupKey);
			else next.add(groupKey);
			return next;
		});

	const renderSortableHeader = (field: typeof SORT_TOTAL_USAGE | typeof SORT_TOTAL_COST, headerLabel: string) => {
		const isActive = sortField === field;
		return (
			<button
				type='button'
				className='group -ms-1 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-start text-content transition-colors'
				onClick={() => {
					if (sortField !== field) {
						setSortField(field);
						setSortDirection('desc');
					} else {
						setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
					}
				}}>
				<span className='leading-none'>{headerLabel}</span>
				{sortDirection === 'asc' && isActive ? (
					<ChevronUp className='h-3.5 w-3.5 shrink-0 text-content' />
				) : isActive ? (
					<ChevronDown className='h-3.5 w-3.5 shrink-0 text-content' />
				) : (
					<ChevronsUpDown className='h-3.5 w-3.5 shrink-0 text-content-secondary' />
				)}
			</button>
		);
	};

	if (!isLoading && rows.length === 0) return null;

	if (isLoading) {
		return (
			<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
				<div className='p-6 border-b border-line'>
					<div className='h-5 w-40 bg-surface-muted animate-pulse rounded' />
				</div>
				<div className='p-6 space-y-3'>
					{[1, 2, 3].map((i) => (
						<div key={i} className='h-8 bg-surface-muted animate-pulse rounded' />
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
			<div className='p-6'>
				<div className='flex items-center justify-between'>
					<h3 className='text-base font-semibold text-content'>{label || t('usageWidgets.breakdownTitle')}</h3>
					{hasGroups && (
						<button
							type='button'
							onClick={toggleExpandAll}
							className='inline-flex items-center justify-center text-content-secondary hover:text-content'
							aria-label={allExpanded ? t('usageWidgets.collapseAllAria') : t('usageWidgets.expandAllAria')}>
							{allExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronsUpDown className='h-4 w-4' />}
						</button>
					)}
				</div>
			</div>

			<div className='px-6 pb-6'>
				<div className='rounded-lg overflow-hidden border border-line'>
					<Table>
						<TableHeader className='h-10 border-b border-line'>
							<TableRow className='border-b border-line'>
								<TableHead className='ps-3 font-semibold text-[13px] w-[35%] text-content'>{t('usageWidgets.feature')}</TableHead>
								<TableHead className='font-semibold text-[13px] text-content'>
									{renderSortableHeader(SORT_TOTAL_USAGE, t('usageWidgets.totalUsage'))}
								</TableHead>
								<TableHead className='font-semibold text-[13px] text-content'>
									{renderSortableHeader(SORT_TOTAL_COST, t('usageWidgets.totalCost'))}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{groupedBuckets.map((bucket) => {
								const isExpanded = expandedGroupIds.has(bucket.groupKey);
								const aggregateCost = bucket.items.reduce((s, i) => s + i.totalCost, 0);
								const firstCurrency = bucket.items[0]?.currency;
								return (
									<React.Fragment key={bucket.groupKey}>
										<TableRow
											role='button'
											tabIndex={0}
											onClick={() => bucket.items.length > 0 && toggleGroup(bucket.groupKey)}
											onKeyDown={(e) => {
												if ((e.key === 'Enter' || e.key === ' ') && bucket.items.length > 0) {
													e.preventDefault();
													toggleGroup(bucket.groupKey);
												}
											}}
											className={cn(
												'h-10 align-middle border-b border-line cursor-pointer outline-none focus:outline-none',
												bucket.items.length === 0 && 'border-b-0 cursor-default',
											)}>
											<TableCell className='ps-3 py-2.5 align-middle'>
												<div className='inline-flex items-center gap-2 text-start'>
													<span className='font-semibold text-[13px] text-content'>{bucket.groupName}</span>
													{bucket.items.length > 0 &&
														(isExpanded ? (
															<ChevronUp className='h-4 w-4 shrink-0 text-content-secondary' aria-hidden />
														) : (
															<ChevronDown className='h-4 w-4 shrink-0 text-content-secondary' aria-hidden />
														))}
												</div>
											</TableCell>
											<TableCell className='py-2.5 font-normal text-[13px] text-content-secondary'>{t('usageWidgets.cellEmDash')}</TableCell>
											<TableCell className='py-2.5 font-normal text-[13px] text-content-secondary'>
												{firstCurrency ? (
													<>
														{getCurrencySymbol(firstCurrency)}
														{formatNumber(aggregateCost, 2)}
													</>
												) : (
													t('usageWidgets.cellEmDash')
												)}
											</TableCell>
										</TableRow>
										{isExpanded &&
											bucket.items.map((row, childIndex) => (
												<TableRow key={`${bucket.groupKey}:${row.id}:${childIndex}`} className='h-10 align-middle border-b border-line'>
													<TableCell className='py-2.5 ps-3 font-normal text-[13px] align-middle text-content'>
														{row.name || t('usageWidgets.unknownRow')}
													</TableCell>
													<TableCell className='py-2.5 font-normal text-[13px] text-content-secondary'>{renderUsageCell(row)}</TableCell>
													<TableCell className='py-2.5 font-normal text-[13px] text-content-secondary'>{renderCostCell(row)}</TableCell>
												</TableRow>
											))}
									</React.Fragment>
								);
							})}
							{ungroupedItems.map((row, index) => (
								<TableRow key={`ungrouped:${row.id}:${index}`} className='h-10 align-middle border-b border-line'>
									<TableCell className='ps-3 py-2.5 font-normal text-[13px] text-content'>{row.name || t('usageWidgets.unknownRow')}</TableCell>
									<TableCell className='py-2.5 font-normal text-[13px] text-content-secondary'>{renderUsageCell(row)}</TableCell>
									<TableCell className='py-2.5 font-normal text-[13px] text-content-secondary'>{renderCostCell(row)}</TableCell>
								</TableRow>
							))}
							{rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={3} className='ps-3 py-4 font-normal text-[13px] text-content-secondary'>
										{t('usageWidgets.cellEmpty')}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</Card>
	);
};

export default UsageBreakdown;
```

- [ ] **Step 14: Run the component test again**

Run: `npx vitest run src/usage/components/UsageBreakdown.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 15: Create the container**

```tsx
// src/usage/containers/UsageBreakdownContainer.tsx
//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `UsageBreakdown`.
// Shares the `['portal-analytics', analyticsParams]` React Query cache entry with
// `UsageTrendChartContainer` — rendering both in the same section costs one API call, not two.
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import type { DashboardAnalyticsRequest } from '@/types';
import { adaptUsageBreakdownRows } from '../adapters';
import UsageBreakdown from '../components/UsageBreakdown';

interface UsageBreakdownContainerProps {
	analyticsParams: DashboardAnalyticsRequest;
	label?: string;
	className?: string;
}

const UsageBreakdownContainer = ({ analyticsParams, label, className }: UsageBreakdownContainerProps) => {
	const { t } = useTranslation('customer-portal');
	const {
		data: analyticsData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['portal-analytics', analyticsParams],
		queryFn: () => CustomerPortalApi.getAnalytics(analyticsParams),
	});

	useEffect(() => {
		if (isError) toast.error(t('errors.loadUsageBreakdown'));
	}, [isError, t]);

	const rows = adaptUsageBreakdownRows(analyticsData?.items ?? []);

	return <UsageBreakdown rows={rows} label={label} isLoading={isLoading} className={className} />;
};

export default UsageBreakdownContainer;
```

- [ ] **Step 16: Full usage test suite + typecheck + lint**

Run: `npx vitest run src/usage/ && npx tsc -b && npx eslint src/usage`
Expected: All tests PASS, no type errors, no lint errors

- [ ] **Step 17: Commit**

```bash
git add src/usage/
git commit -m "feat(flexprice-ui): add exportable UsageBreakdown component"
```

---

## Task 5: Wire into the published package

**Files:**
- Create: `src/usage/lib.ts`
- Modify: `src/exportable/index.ts`
- Modify: `tailwind.flexprice-ui.config.js`
- Modify: `vite.flexprice-ui.config.ts`

**Interfaces:**
- Consumes: `UsageQuota`, `MetricCards`, `UsageTrendChart`, `UsageBreakdown` (components), all `types.ts` exports, `adaptUsageQuotaItems`/`adaptMetricCards`/`adaptUsageTrendSeries`/`adaptUsageBreakdownRows` (adapters), `normalizeUsageQuotaItems`/`normalizeMetricCardItems`/`normalizeUsageTrendSeries`/`normalizeUsageBreakdownRows` (schema).
- Produces: `@flexprice/flexprice-ui` now exports the 4 usage components alongside `PricingCard`/`PricingTable`.

- [ ] **Step 1: Create `src/usage/lib.ts`**

```ts
// src/usage/lib.ts
//
// Usage widgets — FEATURE public surface (presentational only).
//
// Aggregated into the published package via `src/exportable/index.ts` (@flexprice/flexprice-ui).
// Exposes ONLY prop-only UI + pure helpers, so the published bundle never drags in the dashboard's
// data layer (axios/auth/router/react-query). "Bring your own data": fetch usage/wallet/cost
// analytics however you like, map it to the widgets' presentational shapes (via the exported
// adapters, or build the shapes yourself), and render.
//
// Containers (dashboard-only, data-connected) live in `./containers/` and are intentionally NOT
// re-exported here — see `AGENTS.md`'s naming rule: `lib.ts` exports component names, never a
// `*Container`.

// Prop-only UI components — usable individually
export { default as UsageQuota } from './components/UsageQuota';
export { default as MetricCards } from './components/MetricCards';
export { default as UsageTrendChart } from './components/UsageTrendChart';
export { default as UsageBreakdown } from './components/UsageBreakdown';

// Presentational types (public contract, decoupled from backend DTOs)
export type { UsageQuotaItem, UsageQuotaProps } from './types';
export type { MetricCardItem, MetricCardsProps } from './types';
export type { UsageTrendPoint, UsageTrendSeries, UsageTrendChartProps } from './types';
export type { UsageBreakdownRow, UsageBreakdownProps } from './types';

// Runtime validation boundary — normalize untrusted (SDK/BYO-data) input into safe presentational shapes.
export { normalizeUsageQuotaItems, normalizeMetricCardItems, normalizeUsageTrendSeries, normalizeUsageBreakdownRows } from './schema';

// Pure DTO → presentational adapters (optional helpers for consumers mapping Flexprice API data)
export { adaptUsageQuotaItems, adaptMetricCards, adaptUsageTrendSeries, adaptUsageBreakdownRows } from './adapters';
```

- [ ] **Step 2: Modify `src/exportable/index.ts`**

Replace:

```ts
// ── Pricing widget ───────────────────────────────────────────────────────────
export * from '@/pricing/lib';

// ── Future components (uncomment as they become exportable) ───────────────────
// export * from '@/checkout/lib';
// export * from '@/customer-portal/lib';
// export * from '@/usage/lib';
```

with:

```ts
// ── Pricing widget ───────────────────────────────────────────────────────────
export * from '@/pricing/lib';

// ── Usage widgets ────────────────────────────────────────────────────────────
export * from '@/usage/lib';

// ── Future components (uncomment as they become exportable) ───────────────────
// export * from '@/checkout/lib';
// export * from '@/credits/lib';
// export * from '@/invoices/lib';
// export * from '@/subscriptions/lib';
```

- [ ] **Step 3: Modify `tailwind.flexprice-ui.config.js`**

Replace the `createLibTailwindConfig([...])` array with:

```js
export default {
	...createLibTailwindConfig([
		'./src/exportable/**/*.{ts,tsx}',
		// Pricing widget + the shared atoms/ui it renders.
		'./src/pricing/**/*.{ts,tsx}',
		'./src/components/molecules/PricingCard/**/*.{ts,tsx}',
		// Usage widgets + the shared atoms/molecules/ui they render.
		'./src/usage/**/*.{ts,tsx}',
		'./src/components/molecules/CustomerUsageChart.tsx',
		'./src/components/molecules/CustomerUsageChart.i18n.ts',
		'./src/components/molecules/MetricCard.tsx',
		'./src/components/molecules/Table/**/*.{ts,tsx}',
		'./src/components/atoms/Card/**/*.{ts,tsx}',
		'./src/components/atoms/Progress/**/*.{ts,tsx}',
		'./src/components/ui/**/*.{ts,tsx}',
		'./src/components/atoms/Select/**/*.{ts,tsx}',
		'./src/components/atoms/Input/**/*.{ts,tsx}',
		'./src/components/atoms/Label/**/*.{ts,tsx}',
	]),
	corePlugins: { preflight: false },
};
```

- [ ] **Step 4: Modify `vite.flexprice-ui.config.ts`**

Replace `dtsInclude` with:

```ts
	dtsInclude: ['src/exportable/**/*.ts', 'src/exportable/**/*.tsx', 'src/pricing/**/*.ts', 'src/pricing/**/*.tsx', 'src/usage/**/*.ts', 'src/usage/**/*.tsx'],
```

- [ ] **Step 5: Build the package and verify the new exports are present**

Run: `npm run build:ui`
Expected: Build succeeds. Then run: `grep -c "UsageQuota\|MetricCards\|UsageTrendChart\|UsageBreakdown" packages/flexprice-ui/dist/flexprice-ui.d.mts`
Expected: A non-zero count — the 4 new component names appear in the generated type declarations.

- [ ] **Step 6: Commit**

```bash
git add src/usage/lib.ts src/exportable/index.ts tailwind.flexprice-ui.config.js vite.flexprice-ui.config.ts
git commit -m "feat(flexprice-ui): publish the 4 usage widgets from @flexprice/flexprice-ui"
```

---

## Task 6: Repoint the dashboard's customer portal and delete the old widgets

**Files:**
- Modify: `src/components/customer-portal/TabRenderer.tsx`
- Delete: `src/components/customer-portal/widgets/UsageGraphWidget.tsx`
- Delete: `src/components/customer-portal/widgets/UsageBreakdownWidget.tsx`
- Delete: `src/components/customer-portal/widgets/MetricCardsWidget.tsx`
- Delete: `src/components/customer-portal/widgets/CurrentUsageWidget.tsx`

**Interfaces:**
- Consumes: `UsageQuotaContainer`, `MetricCardsContainer`, `UsageTrendChartContainer`, `UsageBreakdownContainer` from `@/usage/containers/*` (Tasks 1–4).

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
const WalletBalanceWidget = lazy(() => import('./widgets/WalletBalanceWidget'));
const WalletTransactionsWidget = lazy(() => import('./widgets/WalletTransactionsWidget'));
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
				<UsageTrendChartContainer config={tab.usage_graph ?? DEFAULT_USAGE_GRAPH_CONFIG} analyticsParams={analyticsParams} label={tab.label} />
			)}
			{tab.type === 'usage_breakdown' && <UsageBreakdownContainer analyticsParams={analyticsParams} label={tab.label} />}
			{tab.type === 'invoices' && <InvoicesWidget />}
			{tab.type === 'wallet_balance' && <WalletBalanceWidget />}
			{tab.type === 'wallet_transactions' && <WalletTransactionsWidget />}
			{tab.type === 'metric_cards' && <MetricCardsContainer analyticsParams={analyticsParams} config={tab.metric_cards} />}
		</Suspense>
	);
};

export default TabRenderer;
```

Note: `UsageQuotaContainer` as written in Task 1 takes no `usageData` prop (it fetches its own via `getUsageSummary`) — update its signature to accept an optional pre-fetched `usageData` so it matches `SectionContent`'s existing shared-fetch design (avoids a duplicate `portal-usage` query when `SectionContent` already fetched it):

```tsx
// src/usage/containers/UsageQuotaContainer.tsx — replace the whole file
import { useQuery } from '@tanstack/react-query';
import type { CustomerUsage } from '@/models';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { adaptUsageQuotaItems } from '../adapters';
import UsageQuota from '../components/UsageQuota';

interface UsageQuotaContainerProps {
	/** Pre-fetched by a parent (e.g. `SectionContent`) sharing the `['portal-usage']` cache entry. */
	usageData?: CustomerUsage[];
	label?: string;
	className?: string;
}

const UsageQuotaContainer = ({ usageData, label, className }: UsageQuotaContainerProps) => {
	const { data } = useQuery({
		queryKey: ['portal-usage'],
		queryFn: () => CustomerPortalApi.getUsageSummary(),
		enabled: usageData === undefined,
	});

	const items = adaptUsageQuotaItems(usageData ?? data?.features ?? []);

	return <UsageQuota items={items} label={label} className={className} />;
};

export default UsageQuotaContainer;
```

- [ ] **Step 2: Delete the superseded widget files**

```bash
git rm src/components/customer-portal/widgets/UsageGraphWidget.tsx
git rm src/components/customer-portal/widgets/UsageBreakdownWidget.tsx
git rm src/components/customer-portal/widgets/MetricCardsWidget.tsx
git rm src/components/customer-portal/widgets/CurrentUsageWidget.tsx
```

- [ ] **Step 3: Confirm nothing else references the deleted widgets**

Run: `grep -rln "widgets/UsageGraphWidget\|widgets/UsageBreakdownWidget\|widgets/MetricCardsWidget\|widgets/CurrentUsageWidget" src --include="*.tsx" --include="*.ts"`
Expected: no output (only `TabRenderer.tsx` referenced them, and it no longer does)

- [ ] **Step 4: Typecheck, lint, and run the full customer-portal + usage test suites**

Run: `npx tsc -b && npx eslint src/components/customer-portal src/usage && npx vitest run src/components/customer-portal src/usage`
Expected: no type errors, no lint errors, all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/customer-portal/TabRenderer.tsx src/usage/containers/UsageQuotaContainer.tsx
git commit -m "refactor(customer-portal): repoint TabRenderer at the exportable usage containers"
```

---

## Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build && npm run build:ui`
Expected: both succeed with zero TypeScript errors

- [ ] **Step 2: Full lint**

Run: `npx eslint src/ vite.config.ts vitest.config.ts .storybook`
Expected: zero errors

- [ ] **Step 3: Full test suite**

Run: `npx vitest run`
Expected: all tests PASS (including the pre-existing suite — confirms nothing else regressed)

- [ ] **Step 4: Manual smoke check of the customer portal**

Start the dev server (`npm run dev`), open a customer portal URL with a `usage` section enabled (`metric_cards`, `usage_graph`, `usage_breakdown`, `current_usage` tabs), and confirm all four render with live data, matching the pre-refactor visual appearance (light-mode default styling — the `--portal-*` theme override path is no longer read by these four tabs, which is the intended change from this plan's design spec).

- [ ] **Step 5: Commit (only if Step 4 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in exportable usage widgets smoke test"
```
