// src/credits/schema.ts
//
// Runtime validation / normalization boundary for the credits widgets.
//
// WHY: containers feed trusted, adapter-produced data, but external SDK consumers pass raw props
// from their own code/API. TypeScript disappears at runtime, so a JS consumer — or a TS one using
// `as any` — can hand us the wrong shape. Rather than crash (white screen), we coerce what we can
// and surface issues via `onValidationError`. Mirrors `src/usage/schema.ts`.
import { z } from 'zod';
import { createNormalizer } from '@/lib/exportable/validation';
import type { CreditBalanceData } from './types';

const nullishToString = z.preprocess((v) => (v == null ? '' : v), z.coerce.string()).catch('');
// Required-with-default variant: null/undefined fall back to 'USD' instead of the empty string.
const nullishToCurrency = z.preprocess((v) => (v == null || v === '' ? 'USD' : v), z.coerce.string()).catch('USD');

// NOTE: unlike `src/usage/schema.ts`, this module has no array normalizer — `normalizeOne` (see
// `createNormalizer` in `@/lib/exportable/validation`) takes no `onIssue` callback, so there is no
// `devWarn`-style dev-console reporter here. A lone `<CreditBalance>` repairs invalid input
// silently rather than dropping it (see `normalizeCreditBalanceData` below).

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
