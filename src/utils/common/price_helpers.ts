import { Price } from '@/models/Price';
import { BILLING_MODEL, PRICE_TYPE } from '@/models/Price';
import { getCurrencySymbol } from './helper_functions';
import { formatAmount } from '@/components/atoms/Input/Input';

export const getPriceTableCharge = (price: Price, normalizedPrice: boolean = true) => {
	if (price.type === PRICE_TYPE.FIXED) {
		return `${getCurrencySymbol(price.currency)}${formatAmount(price.amount.toString())}`;
	} else {
		if (price.billing_model === BILLING_MODEL.PACKAGE) {
			return `${getCurrencySymbol(price.currency)}${formatAmount(price.amount.toString())} / ${formatAmount((price.transform_quantity as { divide_by: number }).divide_by.toString())} units`;
		} else if (price.billing_model === BILLING_MODEL.FLAT_FEE) {
			return `${getCurrencySymbol(price.currency)}${formatAmount(price.amount.toString())} / unit`;
		} else if (price.billing_model === BILLING_MODEL.TIERED) {
			return `Starts at ${normalizedPrice ? price.currency : getCurrencySymbol(price.currency)}${formatAmount(price.tiers?.[0]?.unit_amount?.toString() || '0')} / unit`;
		} else {
			return `${price.display_amount}`;
		}
	}
};

export const getActualPriceForTotal = (price: Price) => {
	let result = 0;
	if (price.billing_model === BILLING_MODEL.PACKAGE) {
		result = parseFloat(price.amount);
	} else if (price.billing_model === BILLING_MODEL.TIERED) {
		result = parseFloat(String(price.tiers?.[0]?.flat_amount || '0'));
	} else {
		result = parseFloat(price.amount);
	}

	return result;
};
