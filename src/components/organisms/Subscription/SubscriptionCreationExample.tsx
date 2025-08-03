import { FC, useState } from 'react';
import { Price } from '@/models/Price';
import { SubscriptionWithOverrides } from './';
import { SubscriptionLineItemOverrideRequest } from '@/utils/common/price_override_helpers';

interface Props {
	prices: Price[];
	onCreateSubscription: (subscriptionData: {
		plan_id: string;
		customer_id: string;
		start_date: string;
		override_line_items?: SubscriptionLineItemOverrideRequest[];
	}) => Promise<void>;
	planId: string;
	customerId: string;
	startDate: string;
}

const SubscriptionCreationExample: FC<Props> = ({ prices, onCreateSubscription, planId, customerId, startDate }) => {
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateSubscription = async (lineItemOverrides: SubscriptionLineItemOverrideRequest[]) => {
		setIsCreating(true);
		try {
			await onCreateSubscription({
				plan_id: planId,
				customer_id: customerId,
				start_date: startDate,
				override_line_items: lineItemOverrides.length > 0 ? lineItemOverrides : undefined,
			});
		} catch (error) {
			console.error('Failed to create subscription:', error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className='space-y-6'>
			<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
				<h3 className='text-lg font-semibold text-blue-900 mb-2'>Subscription Creation with Price Overrides</h3>
				<p className='text-blue-700 text-sm'>
					You can override prices for FLAT_FEE and PACKAGE billing models. Click the edit button next to any price to modify it.
				</p>
			</div>

			<SubscriptionWithOverrides prices={prices} onCreateSubscription={handleCreateSubscription} />

			{isCreating && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg p-6 text-center'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
						<p className='text-gray-700'>Creating subscription...</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default SubscriptionCreationExample;
