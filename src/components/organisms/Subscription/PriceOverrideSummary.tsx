import { FC } from 'react';
import { Price } from '@/models/Price';
import { SubscriptionLineItemOverrideRequest } from '@/utils/common/price_override_helpers';
import { formatAmount } from '@/components/atoms/Input/Input';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/atoms';

interface Props {
	overrides: SubscriptionLineItemOverrideRequest[];
	prices: Price[];
	className?: string;
}

const PriceOverrideSummary: FC<Props> = ({ overrides, prices, className }) => {
	if (overrides.length === 0) return null;

	return (
		<Card className={`border bg-gray-50 rounded-lg p-4 ${className}`}>
			<div className='flex items-start gap-3'>
				<CheckCircle className='w-5 h-5  mt-0.5 flex-shrink-0' />
				<div className='flex-1 min-w-0'>
					<h4 className='font-medium mb-3'>Price Overrides Applied ({overrides.length})</h4>
					<div className='space-y-3'>
						{overrides.map((override) => {
							const price = prices.find((p) => p.id === override.price_id);
							if (!price) return null;

							const originalAmount = formatAmount(price.amount);
							const newAmount = formatAmount(override.amount?.toString() || '0');
							const currencySymbol = getCurrencySymbol(price.currency);

							return (
								<div key={override.price_id} className='flex items-center justify-between text-sm text-muted-foreground'>
									<span className='truncate'>{price.meter?.name || price.description || 'Charge'}</span>
									<span className='ml-2 flex-shrink-0'>
										{currencySymbol}
										{originalAmount} → {currencySymbol}
										{newAmount}
									</span>
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
