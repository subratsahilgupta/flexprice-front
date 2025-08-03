import { useState, useCallback } from 'react';
import { Price } from '@/models/Price';
import {
	SubscriptionLineItemOverrideRequest,
	getLineItemOverrides,
	hasPriceOverrides,
	getOverriddenPricesCount,
} from '@/utils/common/price_override_helpers';

export const usePriceOverrides = (prices: Price[]) => {
	const [overriddenPrices, setOverriddenPrices] = useState<Record<string, string>>({});

	const overridePrice = useCallback((priceId: string, newAmount: string) => {
		setOverriddenPrices((prev) => ({
			...prev,
			[priceId]: newAmount,
		}));
	}, []);

	const resetOverride = useCallback((priceId: string) => {
		setOverriddenPrices((prev) => {
			const newState = { ...prev };
			delete newState[priceId];
			return newState;
		});
	}, []);

	const resetAllOverrides = useCallback(() => {
		setOverriddenPrices({});
	}, []);

	const getLineItemOverridesForBackend = useCallback((): SubscriptionLineItemOverrideRequest[] => {
		return getLineItemOverrides(prices, overriddenPrices);
	}, [prices, overriddenPrices]);

	const hasAnyOverrides = useCallback((): boolean => {
		return hasPriceOverrides(overriddenPrices);
	}, [overriddenPrices]);

	const getOverridesCount = useCallback((): number => {
		return getOverriddenPricesCount(overriddenPrices);
	}, [overriddenPrices]);

	return {
		overriddenPrices,
		overridePrice,
		resetOverride,
		resetAllOverrides,
		getLineItemOverridesForBackend,
		hasAnyOverrides,
		getOverridesCount,
	};
};
