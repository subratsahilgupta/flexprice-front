import { FC } from 'react';
import { Price } from '@/models/Price';
import { SubscriptionLineItemOverrideRequest } from '@/utils/common/price_override_helpers';
import { formatAmount } from '@/components/atoms/Input/Input';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { Check } from 'lucide-react';
import { Card } from '@/components/atoms';

interface Props {
	overrides: SubscriptionLineItemOverrideRequest[];
	prices: Price[];
	className?: string;
}

const PriceOverrideSummary: FC<Props> = ({ overrides, prices, className }) => {
	if (overrides.length === 0) return null;

	const getOverrideDescription = (override: SubscriptionLineItemOverrideRequest, price: Price): string => {
		const descriptions: string[] = [];

		if (override.amount !== undefined) {
			const originalAmount = formatAmount(price.amount);
			const newAmount = formatAmount(override.amount.toString());
			const currencySymbol = getCurrencySymbol(price.currency);
			descriptions.push(`Amount: ${currencySymbol}${originalAmount} → ${currencySymbol}${newAmount}`);
		}

		if (override.quantity !== undefined) {
			descriptions.push(`Quantity: ${override.quantity}`);
		}

		if (override.billing_model !== undefined) {
			descriptions.push(`Billing Model: ${override.billing_model.replace('_', ' ')}`);
		}

		if (override.tier_mode !== undefined) {
			descriptions.push(`Tier Mode: ${override.tier_mode}`);
		}

		if (override.tiers !== undefined && override.tiers.length > 0) {
			descriptions.push(`Tiers: ${override.tiers.length} tier(s)`);
		}

		if (override.transform_quantity !== undefined) {
			const { divide_by, round } = override.transform_quantity;
			descriptions.push(`Package: ${divide_by} units, round ${round}`);
		}

		return descriptions.join(', ');
	};

	return (
		<Card className={`border bg-gray-50 rounded-lg p-4 ${className}`}>
			<div className='flex items-start gap-3'>
				<Check className='w-5 h-5  mt-0.5 flex-shrink-0' />
				<div className='flex-1 min-w-0'>
					<h4 className='font-medium mb-3'>Price Overrides Applied ({overrides.length})</h4>
					<div className='space-y-3'>
						{overrides.map((override) => {
							const price = prices.find((p) => p.id === override.price_id);
							if (!price) return null;

							const overrideDescription = getOverrideDescription(override, price);

							return (
								<div key={override.price_id} className='flex items-center justify-between text-sm text-muted-foreground'>
									<span className='truncate'>{price.meter?.name || price.description || 'Charge'}</span>
									<span className='ml-2 flex-shrink-0 text-xs'>{overrideDescription}</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</Card>
	);
};

export default PriceOverrideSummary;
