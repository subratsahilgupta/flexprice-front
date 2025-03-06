import { Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatBillingPeriodForPrice, getCurrencySymbol } from '@/utils/common/helper_functions';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';

export interface PricingCardProps {
	id: string;
	name: string;
	description: string;
	price: {
		amount?: string;
		currency?: string;
		displayAmount?: string;
		billingPeriod?: string;
	};
	entitlements: Array<{
		id: string;
		name: string;
		type: 'STATIC' | 'BOOLEAN' | 'METERED';
		value: string | number | boolean;
		description?: string;
		usage_reset_period?: string;
	}>;
	onPurchase?: () => void;
	className?: string;
}

const formatEntitlementValue = ({
	type,
	value,
	name,
	usage_reset_period,
}: {
	type: string;
	value: string | number | boolean;
	name: string;
	usage_reset_period: string;
}) => {
	switch (type) {
		case 'STATIC':
			return `${value} ${name}`;
		case 'BOOLEAN':
			return value ? `${name}` : `${name} Not included`;
		case 'METERED':
			return `${value} ${name}${usage_reset_period ? ` per ${formatBillingPeriodForPrice(usage_reset_period || '')}` : ''}`;
		default:
			return `${value}`;
	}
};

const PricingCard: React.FC<PricingCardProps> = ({ id, name, price, entitlements, className = '' }) => {
	const navigate = useNavigate();
	const displayAmount = price.displayAmount || `${getCurrencySymbol(price.currency || '')}${price.amount}`;

	return (
		<div className={`rounded-3xl border border-gray-100 p-7 bg-white hover:border-gray-200 transition-all shadow-sm ${className}`}>
			{/* Header */}
			<div className='space-y-2'>
				<h3 className='text-xl font-medium text-gray-900'>{name}</h3>
				{/* <p className='text-sm font-normal text-gray-500 leading-relaxed'>{description}</p> */}
			</div>

			{/* Price */}
			<div className='mt-6'>
				<div className='flex items-baseline'>
					<span className='text-4xl font-normal text-gray-900'>{displayAmount}</span>
					<span className='ml-2 text-sm text-gray-500'>/{formatBillingPeriodForPrice(price.billingPeriod || '')}</span>
				</div>
			</div>

			{/* Purchase Button */}
			<div className='mt-6'>
				<Button
					onClick={() => {
						console.log('View plan');
						navigate(`${RouteNames.plan}/${id}`);
					}}
					className='w-full bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl py-3 text-sm font-medium transition-colors'
					variant='outline'>
					View plan
				</Button>
			</div>

			{/* Features List */}
			<div className='mt-7'>
				{entitlements.length > 0 ? (
					<ul className='space-y-3.5'>
						{entitlements.map((entitlement) => (
							<li key={entitlement.id} className='flex items-center gap-3'>
								<Check className='h-[18px] w-[18px] text-gray-600 flex-shrink-0' />
								<span className='flex-1 text-[15px] text-gray-600 font-normal'>
									{formatEntitlementValue({
										type: entitlement.type,
										value: entitlement.value,
										name: entitlement.name,
										usage_reset_period: entitlement.usage_reset_period || '',
									})}
								</span>
								{entitlement.description && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger className='cursor-pointer'>
												<div>
													<Info className='h-4 w-4 text-gray-400 hover:text-gray-500 transition-colors duration-150' />
												</div>
											</TooltipTrigger>
											<TooltipContent sideOffset={5} className='bg-gray-900 text-xs text-white px-3 py-1.5 rounded-lg max-w-[200px]'>
												{entitlement.description}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</li>
						))}
					</ul>
				) : (
					<div className='text-center'>
						<p className='text-sm text-gray-500 mb-2'>No entitlements added yet</p>
						<button
							onClick={() => navigate(`${RouteNames.plan}/${id}`)}
							className='text-sm text-gray-900 underline hover:text-gray-700 transition-colors'>
							Add entitlements
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default PricingCard;
