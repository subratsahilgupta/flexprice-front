// Runtime validation for the usage-syncs data layer's API responses.
//
// The page trusts its own API, but a schema/backend drift shouldn't crash it: a malformed payload
// is dropped (logged in dev) before it reaches the table. The schema is intentionally lenient —
// `.passthrough()` keeps every real field, and only `id` (the table's row key) is required.
import { z } from 'zod';

export const usageRecordItemSchema = z.object({ id: z.string().min(1) }).passthrough();

/**
 * Validate a paginated `{ items: [...] }` response, returning only the items that pass `itemSchema`.
 * Non-array payloads yield `[]`; individual invalid items are dropped (both logged in dev).
 */
export function validateResponseItems<T>(itemSchema: z.ZodType<T>, raw: unknown, label: string): T[] {
	const envelope = z
		.object({ items: z.array(z.unknown()) })
		.passthrough()
		.safeParse(raw);
	if (!envelope.success) {
		// Keep the format string constant and pass `label` as a substitution value - interpolating
		// it directly would let a stray %-specifier in a future dynamic label forge the logged output.
		if (import.meta.env?.DEV) console.warn('[%s] response is not a paginated { items: [] } shape', label, envelope.error.issues);
		return [];
	}
	const out: T[] = [];
	for (const item of envelope.data.items) {
		const result = itemSchema.safeParse(item);
		if (result.success) out.push(result.data);
		else if (import.meta.env?.DEV) console.warn('[%s] dropped invalid item', label, result.error.issues);
	}
	return out;
}
