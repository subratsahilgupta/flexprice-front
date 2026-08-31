import type { Price } from '@/models/Price';
import { BILLING_PERIOD } from '@/constants/constants';
import { isCadenceCompatible } from './cadenceCompatibility';

/** Plan/catalog price is a one-time charge (backend: billing_period ONETIME). */
export function isOneTimePlanPrice(price: { billing_period: string | BILLING_PERIOD }): boolean {
	return String(price.billing_period).toUpperCase() === BILLING_PERIOD.ONETIME;
}

/**
 * Prices shown on subscription create/edit for a chosen subscription cadence and currency:
 * every price whose billing cadence evenly divides the subscription cadence (same-cadence
 * and finer-cadence prices, per backend PR #2699 fan-out rules), plus all one-time plan
 * prices in the same currency.
 */
export function filterPlanPricesForSubscriptionCharges(
	prices: Price[],
	selectedRecurringPeriod: BILLING_PERIOD,
	currency: string,
	selectedRecurringPeriodCount: number = 1,
): Price[] {
	const currencyLower = currency.toLowerCase();
	return prices.filter((p) => {
		if (p.currency.toLowerCase() !== currencyLower) return false;
		return isCadenceCompatible(selectedRecurringPeriod, selectedRecurringPeriodCount, p.billing_period, p.billing_period_count);
	});
}

/** Distinct recurring billing periods on a plan (excludes ONETIME — not selectable as subscription cadence). */
export function uniqueRecurringBillingPeriodsFromPrices(prices: { billing_period: string | BILLING_PERIOD }[]): BILLING_PERIOD[] {
	const set = new Set<BILLING_PERIOD>();
	for (const p of prices) {
		if (isOneTimePlanPrice(p)) continue;
		const key = p.billing_period.toUpperCase();
		if ((Object.values(BILLING_PERIOD) as string[]).includes(key)) {
			set.add(key as BILLING_PERIOD);
		}
	}
	return [...set];
}
