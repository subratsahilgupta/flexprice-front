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
