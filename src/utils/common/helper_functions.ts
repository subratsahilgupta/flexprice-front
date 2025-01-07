export function getCurrencySymbol(currency: string): string {
	switch (currency) {
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

export const mapBillingPeriod = (billingPeriod: string) => {
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
