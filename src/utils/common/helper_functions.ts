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
			return '--';
	}
};

export const formatPriceType = (type: string): string => {
	switch (type.toUpperCase()) {
		case 'FIXED':
			return 'Recurring';
		case 'USAGE':
			return 'Usage Based';
		default:
			return '--';
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

interface DateFormatOptions {
	type?: 'short' | 'full';
	showMonth?: boolean;
	showYear?: boolean;
	showDate?: boolean;
	showDay?: boolean;
	showHour?: boolean;
	showMinute?: boolean;
	showSecond?: boolean;
	showAmPm?: boolean;
	operation?: 'add' | 'subtract';
	value?: number;
	unit?: 'hours' | 'minutes' | 'days' | 'months';
}

export const formatDate = (dateInput?: Date | string, options: DateFormatOptions = {}): string => {
	if (!dateInput) return '';
	const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

	if (options.operation && options.value && options.unit) {
		const value = options.operation === 'subtract' ? -options.value : options.value;
		switch (options.unit) {
			case 'hours':
				date.setHours(date.getHours() + value);
				break;
			case 'minutes':
				date.setMinutes(date.getMinutes() + value);
				break;
			case 'days':
				date.setDate(date.getDate() + value);
				break;
			case 'months':
				date.setMonth(date.getMonth() + value);
				break;
		}
	}

	const formatOptions: Intl.DateTimeFormatOptions = {};

	if (options.type === 'short') {
		formatOptions.month = 'short';
		formatOptions.day = 'numeric';
		formatOptions.year = 'numeric';
	} else if (options.type === 'full') {
		formatOptions.month = 'long';
		formatOptions.day = 'numeric';
		formatOptions.year = 'numeric';
	}

	if (options.showMonth) formatOptions.month = 'long';
	if (options.showYear) formatOptions.year = 'numeric';
	if (options.showDate) formatOptions.day = 'numeric';
	if (options.showDay) formatOptions.weekday = 'long';
	if (options.showHour) formatOptions.hour = 'numeric';
	if (options.showMinute) formatOptions.minute = 'numeric';
	if (options.showSecond) formatOptions.second = 'numeric';
	if (options.showAmPm) formatOptions.hour12 = true;

	const formattedDate = date.toLocaleDateString('en-US', formatOptions);

	if (options.type === 'full' || options.type === 'short') {
		const day = date.getDate();
		const daySuffix =
			day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
		return formattedDate.replace(/\b\d{1,2}\b/, `${day}${daySuffix}`);
	}

	return formattedDate;
};
