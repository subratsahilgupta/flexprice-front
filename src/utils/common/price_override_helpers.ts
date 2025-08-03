import { Price } from '@/models/Price';

/**
 * Interface for line item overrides that will be sent to the backend
 */
export interface SubscriptionLineItemOverrideRequest {
	price_id: string;
	quantity?: number;
	amount?: number;
}

/**
 * Check if a price has been overridden
 */
export const isPriceOverridden = (priceId: string, overriddenPrices: Record<string, string>): boolean => {
	return overriddenPrices[priceId] !== undefined;
};

/**
 * Get the current amount for a price (original or overridden)
 */
export const getCurrentPriceAmount = (price: Price, overriddenPrices: Record<string, string>): string => {
	return overriddenPrices[price.id] || price.amount;
};

/**
 * Get all overridden prices as line item overrides for backend submission
 */
export const getLineItemOverrides = (prices: Price[], overriddenPrices: Record<string, string>): SubscriptionLineItemOverrideRequest[] => {
	return Object.entries(overriddenPrices)
		.filter(([priceId, newAmount]) => {
			const price = prices.find((p) => p.id === priceId);
			return price && newAmount !== price.amount;
		})
		.map(([priceId, amount]) => ({
			price_id: priceId,
			amount: parseFloat(amount),
		}));
};

/**
 * Check if there are any price overrides
 */
export const hasPriceOverrides = (overriddenPrices: Record<string, string>): boolean => {
	return Object.keys(overriddenPrices).length > 0;
};

/**
 * Get the count of overridden prices
 */
export const getOverriddenPricesCount = (overriddenPrices: Record<string, string>): number => {
	return Object.keys(overriddenPrices).length;
};

/**
 * Get a summary of price overrides for display
 */
export const getPriceOverridesSummary = (_: Price[], overriddenPrices: Record<string, string>): string => {
	const overriddenCount = getOverriddenPricesCount(overriddenPrices);
	if (overriddenCount === 0) return '';
	return `${overriddenCount} price${overriddenCount > 1 ? 's' : ''} overridden`;
};
