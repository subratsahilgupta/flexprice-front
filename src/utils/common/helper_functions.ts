export function getCurrencySymbol(currency: string): string {
	switch (currency) {
		case 'usd':
			return '$';
		case 'inr':
			return '$';
		case 'eur':
			return '€';
		default:
			return currency;
	}
}
