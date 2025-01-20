import { ChargesForBillingPeriodOne } from '@/components/organisms/Subscription/PriceTable';

export function getCurrencySymbol(currency: string): string {
	switch (currency.toLowerCase()) {
		case 'usd':
			return '$';
		case 'inr':
			return '₹';
		case 'eur':
			return '€';
		default:
			return currency;
	}
}

export const formatBillingPeriod = (billingPeriod: string) => {
	switch (billingPeriod.toUpperCase()) {
		case 'DAILY':
			return 'day';
		case 'WEEKLY':
			return 'week';
		case 'MONTHLY':
			return 'month';
		case 'ANNUAL':
			return 'year';
		default:
			return '';
	}
};

export const toSentenceCase = (str: string): string => {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getTotalPayableText = (
	recurringCharges: ChargesForBillingPeriodOne[],
	usageCharges: ChargesForBillingPeriodOne[],
	recurringTotal: number,
) => {
	let text = '';

	if (recurringCharges.length > 0) {
		text += `${recurringCharges[0].currency}${recurringTotal}`;
	}

	if (usageCharges.length > 0) {
		if (recurringCharges.length > 0) {
			text += ' + Usage';
		} else {
			text += 'Depends on usage';
		}
	}

	return text;
};

export const getTotalPayableInfo = (
	recurringCharges: ChargesForBillingPeriodOne[],
	usageCharges: ChargesForBillingPeriodOne[],
	recurringTotal: number,
) => {
	let text = '';

	if (recurringCharges.length > 0) {
		text += `${recurringCharges[0].currency}${recurringTotal}`;
	}

	if (usageCharges.length > 0) {
		if (recurringCharges.length > 0) {
			text += ' + Usage';
		} else {
			text += 'depending on usage';
		}
	}

	return text;
};

export const formatDateShort = (dateString: string): string => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
	return date.toLocaleDateString('en-US', options);
};
