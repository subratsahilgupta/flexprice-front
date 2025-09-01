import { BILLING_MODEL, CreatePriceTier, Price, TIER_MODE } from '@/models/Price';
import { getPriceTableCharge, calculateDiscountedPrice } from '@/utils/common/price_helpers';
import { Info } from 'lucide-react';
import { formatAmount } from '@/components/atoms/Input/Input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { Coupon } from '@/models/Coupon';
import formatCouponName from '@/utils/common/format_coupon_name';
import { ExtendedPriceOverride } from '@/utils/common/price_override_helpers';

interface Props {
	data: Price;
	overriddenAmount?: string;
	appliedCoupon?: Coupon | null;
	priceOverride?: ExtendedPriceOverride; // Add this to get full override details
}

const ChargeValueCell = ({ data, overriddenAmount, appliedCoupon, priceOverride }: Props) => {
	// Use overridden amount if provided, otherwise use original price
	const priceData = overriddenAmount ? { ...data, amount: overriddenAmount } : data;

	// If we have tiered overrides, create a custom display instead of using getPriceTableCharge
	let price: React.ReactNode;
	if (
		priceOverride?.tiers &&
		priceOverride.tiers.length > 0 &&
		(priceOverride.billing_model === BILLING_MODEL.TIERED || priceOverride.billing_model === 'SLAB_TIERED')
	) {
		// Show tiered pricing information
		const firstTier = priceOverride.tiers[0];
		const currencySymbol = getCurrencySymbol(data.currency);
		price = (
			<div>
				starts at {currencySymbol}
				{formatAmount(firstTier.unit_amount || '0')} per unit
			</div>
		);
	} else if (priceOverride?.billing_model === BILLING_MODEL.PACKAGE && priceOverride.transform_quantity) {
		// Show package pricing with overridden transform quantity
		const currencySymbol = getCurrencySymbol(data.currency);
		const overriddenAmount = priceOverride.amount || data.amount;
		const divideBy = priceOverride.transform_quantity.divide_by;
		price = (
			<div>
				{currencySymbol}
				{formatAmount(overriddenAmount)} / {divideBy} units
			</div>
		);
	} else if (priceOverride?.billing_model === BILLING_MODEL.TIERED && priceOverride.tiers && priceOverride.tiers.length > 0) {
		// Show tiered pricing when overridden from another billing model
		const firstTier = priceOverride.tiers[0];
		const currencySymbol = getCurrencySymbol(data.currency);
		price = (
			<div>
				starts at {currencySymbol}
				{formatAmount(firstTier.unit_amount || '0')} per unit
			</div>
		);
	} else {
		// Use normal price display
		price = getPriceTableCharge(priceData, false);
	}

	// Determine which tiers to show - overridden or original
	const tiers =
		priceOverride?.tiers ||
		(data.tiers as Array<{
			up_to: number | null;
			unit_amount: string;
			flat_amount: string;
		}> | null);

	// Determine billing model and tier mode - use overridden values if available
	const effectiveBillingModel = priceOverride?.billing_model || data.billing_model;
	const effectiveTierMode = priceOverride?.tier_mode || data.tier_mode;

	const isTiered =
		(effectiveBillingModel === BILLING_MODEL.TIERED || effectiveBillingModel === 'SLAB_TIERED') && Array.isArray(tiers) && tiers.length > 0;

	// Calculate discount if coupon is applied and price is not overridden
	const discountInfo = !overriddenAmount && appliedCoupon ? calculateDiscountedPrice(data, appliedCoupon) : null;

	const formatRange = (tier: CreatePriceTier, index: number, allTiers: CreatePriceTier[]) => {
		// Calculate 'from' based on previous tier's up_to, first tier starts at 0
		const from = index === 0 ? 0 : allTiers[index - 1].up_to;

		// For the last tier or when up_to is null, show infinity
		if (tier.up_to === null || index === allTiers.length - 1) {
			return `${from} - ∞`;
		}
		return `${from} - ${tier.up_to}`;
	};

	// Check if there are any overrides beyond just amount
	const hasOverrides =
		priceOverride &&
		(priceOverride.billing_model !== undefined ||
			priceOverride.tier_mode !== undefined ||
			priceOverride.tiers !== undefined ||
			priceOverride.quantity !== undefined ||
			priceOverride.transform_quantity !== undefined);

	return (
		<div className='flex items-center gap-2'>
			{discountInfo ? (
				// Show discounted price with strikethrough original
				<div className='flex items-center gap-2'>
					<div className='flex flex-col'>
						<div className='line-through text-gray-400 text-sm'>
							{getCurrencySymbol(data.currency)}
							{formatAmount(discountInfo.originalAmount.toString())}
						</div>
						<div className='text-gray-900 font-medium'>
							{getCurrencySymbol(data.currency)}
							{formatAmount(discountInfo.discountedAmount.toString())}
						</div>
					</div>
					{/* Coupon info icon */}
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger>
								<Info className='h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors duration-150' />
							</TooltipTrigger>
							<TooltipContent
								sideOffset={5}
								className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-3 py-2 rounded-lg'>
								<div className='font-medium'>{appliedCoupon ? formatCouponName(appliedCoupon) : 'No coupon applied'}</div>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			) : (
				// Show normal price
				<div>{price}</div>
			)}

			{/* Show override indicator if there are overrides */}
			{hasOverrides && (
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger>
							<Info className='h-4 w-4 text-orange-500 hover:text-orange-600 transition-colors duration-150' />
						</TooltipTrigger>
						<TooltipContent
							sideOffset={5}
							className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-4 py-3 rounded-lg max-w-[300px]'>
							<div className='space-y-2'>
								<div className='font-medium text-base text-gray-900'>Price Override Applied</div>
								<div className='text-sm text-gray-600'>
									{/* Show original vs overridden pricing */}
									{(() => {
										// Handle tiered pricing overrides
										if (
											priceOverride?.tiers &&
											priceOverride.tiers.length > 0 &&
											(priceOverride.billing_model === BILLING_MODEL.TIERED || priceOverride.billing_model === 'SLAB_TIERED')
										) {
											const firstTier = priceOverride.tiers[0];
											return (
												<div>
													<div>
														Original: {getCurrencySymbol(data.currency)}
														{formatAmount(data.amount)}
													</div>
													<div>
														Now: starts at {getCurrencySymbol(data.currency)}
														{formatAmount(firstTier.unit_amount || '0')} per unit
													</div>
												</div>
											);
										}

										// Handle package pricing overrides
										if (priceOverride?.billing_model === BILLING_MODEL.PACKAGE && priceOverride.transform_quantity) {
											const originalDisplay =
												data.billing_model === BILLING_MODEL.PACKAGE
													? `${getCurrencySymbol(data.currency)}${formatAmount(data.amount)} / ${data.transform_quantity?.divide_by || 1} units`
													: `${getCurrencySymbol(data.currency)}${formatAmount(data.amount)}`;

											return (
												<div>
													<div>Original: {originalDisplay}</div>
													<div>
														Now: {getCurrencySymbol(data.currency)}
														{formatAmount(priceOverride.amount || data.amount)} / {priceOverride.transform_quantity.divide_by} units
													</div>
												</div>
											);
										}

										// Handle simple amount overrides
										if (priceOverride?.amount) {
											return (
												<div>
													<div>
														Original: {getCurrencySymbol(data.currency)}
														{formatAmount(data.amount)}
													</div>
													<div>
														Now: {getCurrencySymbol(data.currency)}
														{formatAmount(priceOverride.amount)}
													</div>
												</div>
											);
										}

										// Handle other configuration changes with meaningful display
										if (priceOverride?.billing_model && priceOverride.billing_model !== data.billing_model) {
											const originalDisplay =
												data.billing_model === BILLING_MODEL.PACKAGE
													? `${getCurrencySymbol(data.currency)}${formatAmount(data.amount)} / ${data.transform_quantity?.divide_by || 1} units`
													: data.billing_model === BILLING_MODEL.TIERED
														? `starts at ${getCurrencySymbol(data.currency)}${formatAmount(data.tiers?.[0]?.unit_amount || '0')} per unit`
														: `${getCurrencySymbol(data.currency)}${formatAmount(data.amount)}`;

											const newDisplay =
												priceOverride.billing_model === BILLING_MODEL.PACKAGE
													? `${getCurrencySymbol(data.currency)}${priceOverride.amount || data.amount} / ${priceOverride.transform_quantity?.divide_by || 1} units`
													: priceOverride.billing_model === BILLING_MODEL.TIERED
														? `starts at ${getCurrencySymbol(data.currency)}${priceOverride.tiers?.[0]?.unit_amount || '0'} per unit`
														: `${getCurrencySymbol(data.currency)}${priceOverride.amount || data.amount}`;

											return (
												<div>
													<div>Original: {originalDisplay}</div>
													<div>Now: {newDisplay}</div>
												</div>
											);
										}

										// Handle quantity changes
										if (priceOverride?.quantity && priceOverride.quantity !== 1) {
											return (
												<div>
													<div>Original: Quantity 1</div>
													<div>Now: Quantity {priceOverride.quantity}</div>
												</div>
											);
										}

										// Handle transform quantity changes for package
										if (priceOverride?.transform_quantity && data.billing_model === BILLING_MODEL.PACKAGE) {
											const originalDivideBy = data.transform_quantity?.divide_by || 1;
											const newDivideBy = priceOverride.transform_quantity.divide_by;
											if (originalDivideBy !== newDivideBy) {
												return (
													<div>
														<div>
															Original: {getCurrencySymbol(data.currency)}
															{formatAmount(data.amount)} / {originalDivideBy} units
														</div>
														<div>
															Now: {getCurrencySymbol(data.currency)}
															{formatAmount(priceOverride.amount || data.amount)} / {newDivideBy} units
														</div>
													</div>
												);
											}
										}

										return <div>Price configuration modified</div>;
									})()}
								</div>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			{isTiered && (
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger>
							<Info className='h-4 w-4 text-gray-400 hover:text-gray-500 transition-colors duration-150' />
						</TooltipTrigger>
						<TooltipContent
							sideOffset={5}
							className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-4 py-3 rounded-lg max-w-[320px]'>
							<div className='space-y-3'>
								<div className='font-medium border-b border-spacing-1 border-gray-200 pb-2 text-base text-gray-900'>
									{effectiveTierMode === TIER_MODE.VOLUME ? 'Volume' : 'Slab'} Tier Pricing
									{hasOverrides && <span className='text-xs text-orange-600 ml-2'>(Overridden)</span>}
								</div>
								<div className='space-y-2 '>
									{tiers.map((tier, index) => (
										<div key={index} className='flex flex-col gap-1'>
											<div className='flex items-center justify-between gap-6'>
												<div className='!font-normal text-muted-foreground'>{formatRange(tier, index, tiers)} units</div>
												<div className='text-right'>
													<div className='!font-normal text-muted-foreground'>
														{getCurrencySymbol(data.currency)}
														{formatAmount(tier.unit_amount)} per unit
													</div>
													{Number(tier.flat_amount) > 0 && (
														<div className='text-xs text-gray-500'>
															+ {getCurrencySymbol(data.currency)}
															{formatAmount(tier.flat_amount || '0')} flat fee
														</div>
													)}
												</div>
											</div>
											{index < tiers.length - 1 && <div className='h-px bg-gray-100' />}
										</div>
									))}
								</div>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
};

export default ChargeValueCell;
