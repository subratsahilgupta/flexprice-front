import { BILLING_PERIOD } from '@/constants/constants';

const MONTHS_PER_PERIOD: Partial<Record<BILLING_PERIOD, number>> = {
	[BILLING_PERIOD.MONTHLY]: 1,
	[BILLING_PERIOD.QUARTERLY]: 3,
	[BILLING_PERIOD.HALF_YEARLY]: 6,
	[BILLING_PERIOD.ANNUAL]: 12,
};

/** Effective months for a (period, count). Returns null for DAILY/WEEKLY/ONETIME — no clean month equivalent. */
export function billingPeriodMonths(period: BILLING_PERIOD | string, count: number = 1): number | null {
	const key = String(period).toUpperCase() as BILLING_PERIOD;
	const base = MONTHS_PER_PERIOD[key];
	if (base == null) return null;
	return base * Math.max(1, count);
}

/**
 * Mirrors backend types.IsCadenceCompatible: a line-item price is compatible with a
 * subscription's cadence when the line item bills at the same or finer rhythm that
 * evenly divides the subscription window. Backend fans out the finer item into N
 * line items per invoice (e.g. monthly price on a quarterly sub → 3 line items).
 *
 *  - ONETIME items are always compatible.
 *  - DAILY/WEEKLY require exact period + count match (no integer month division).
 *  - Month-based items: subMonths % itemMonths === 0.
 */
export function isCadenceCompatible(
	subPeriod: BILLING_PERIOD | string,
	subCount: number | undefined,
	itemPeriod: BILLING_PERIOD | string,
	itemCount: number | undefined,
): boolean {
	const itemKey = String(itemPeriod).toUpperCase();
	if (itemKey === BILLING_PERIOD.ONETIME) return true;

	const subKey = String(subPeriod).toUpperCase();
	const sc = Math.max(1, subCount ?? 1);
	const ic = Math.max(1, itemCount ?? 1);

	const daily = BILLING_PERIOD.DAILY;
	const weekly = BILLING_PERIOD.WEEKLY;
	if (itemKey === daily || itemKey === weekly || subKey === daily || subKey === weekly) {
		return subKey === itemKey && sc === ic;
	}

	const subMonths = billingPeriodMonths(subKey, sc);
	const itemMonths = billingPeriodMonths(itemKey, ic);
	if (subMonths == null || itemMonths == null || itemMonths === 0) return false;
	return subMonths % itemMonths === 0;
}

/**
 * Line-item cycles per subscription invoice window (1 for same-cadence and ONETIME).
 * Returns null when the pair is not compatible.
 */
export function cadenceFanoutCount(
	subPeriod: BILLING_PERIOD | string,
	subCount: number | undefined,
	itemPeriod: BILLING_PERIOD | string,
	itemCount: number | undefined,
): number | null {
	if (!isCadenceCompatible(subPeriod, subCount, itemPeriod, itemCount)) return null;
	const itemKey = String(itemPeriod).toUpperCase();
	if (itemKey === BILLING_PERIOD.ONETIME) return 1;
	const subMonths = billingPeriodMonths(subPeriod, subCount);
	const itemMonths = billingPeriodMonths(itemPeriod, itemCount);
	if (subMonths == null || itemMonths == null || itemMonths === 0) return 1;
	return subMonths / itemMonths;
}
