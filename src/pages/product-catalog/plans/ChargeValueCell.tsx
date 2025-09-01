import { BILLING_MODEL, Price, TIER_MODE } from '@/models/Price';
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
	priceOverride?: ExtendedPriceOverride;
}

const ChargeValueCell = ({ data, overriddenAmount, appliedCoupon, priceOverride }: Props) => {
	// Helper functions
	const formatPriceDisplay = (
		amount: string,
		currency: string,
		billingModel: BILLING_MODEL | 'SLAB_TIERED',
		transformQuantity?: any,
		tiers?: any[] | null,
	) => {
		const currencySymbol = getCurrencySymbol(currency);

		switch (billingModel) {
			case BILLING_MODEL.PACKAGE: {
				const divideBy = transformQuantity?.divide_by || 1;
				return `${currencySymbol}${formatAmount(amount)} / ${divideBy} units`;
			}
			case BILLING_MODEL.TIERED:
			case 'SLAB_TIERED': {
				const firstTier = tiers?.[0];
				return `starts at ${currencySymbol}${formatAmount(firstTier?.unit_amount || '0')} per unit`;
			}
			default:
				return `${currencySymbol}${formatAmount(amount)}`;
		}
	};

	const getOriginalPriceDisplay = () => {
		return formatPriceDisplay(data.amount, data.currency, data.billing_model, data.transform_quantity, data.tiers || undefined);
	};

	const getOverriddenPriceDisplay = () => {
		if (!priceOverride) return null;

		if (priceOverride.billing_model === BILLING_MODEL.PACKAGE && priceOverride.transform_quantity) {
			return formatPriceDisplay(
				priceOverride.amount || data.amount,
				data.currency,
				BILLING_MODEL.PACKAGE,
				priceOverride.transform_quantity,
			);
		}

		if (priceOverride.billing_model === BILLING_MODEL.TIERED && priceOverride.tiers?.length) {
			return formatPriceDisplay(priceOverride.amount || data.amount, data.currency, BILLING_MODEL.TIERED, undefined, priceOverride.tiers);
		}

		// Handle tier overrides even when billing model hasn't changed
		if (priceOverride.tiers && data.billing_model === BILLING_MODEL.TIERED) {
			return formatPriceDisplay(priceOverride.amount || data.amount, data.currency, BILLING_MODEL.TIERED, undefined, priceOverride.tiers);
		}

		if (priceOverride.amount) {
			return formatPriceDisplay(priceOverride.amount, data.currency, data.billing_model, data.transform_quantity, data.tiers);
		}

		return null;
	};

	const renderOverrideTooltip = () => {
		if (!priceOverride) return null;

		const originalDisplay = getOriginalPriceDisplay();
		const overriddenDisplay = getOverriddenPriceDisplay();

		// Handle billing model changes
		if (priceOverride.billing_model && priceOverride.billing_model !== data.billing_model) {
			const newDisplay = formatPriceDisplay(
				priceOverride.amount || data.amount,
				data.currency,
				priceOverride.billing_model,
				priceOverride.transform_quantity,
				priceOverride.tiers,
			);

			return (
				<div>
					<div>Original: {originalDisplay}</div>
					<div>Current: {newDisplay}</div>
				</div>
			);
		}

		// Handle simple amount overrides
		if (priceOverride.amount && overriddenDisplay) {
			return (
				<div>
					<div>Original: {originalDisplay}</div>
					<div>Current: {overriddenDisplay}</div>
				</div>
			);
		}

		// Handle quantity changes
		if (priceOverride.quantity && priceOverride.quantity !== 1) {
			return (
				<div>
					<div>Original: Quantity 1</div>
					<div>Current: Quantity {priceOverride.quantity}</div>
				</div>
			);
		}

		// Handle package size changes
		if (priceOverride.transform_quantity && data.billing_model === BILLING_MODEL.PACKAGE) {
			const originalDivideBy = (data.transform_quantity as any)?.divide_by || 1;
			const newDivideBy = priceOverride.transform_quantity.divide_by;

			if (originalDivideBy !== newDivideBy) {
				return (
					<div>
						<div>
							Original: {getCurrencySymbol(data.currency)}
							{formatAmount(data.amount)} / {originalDivideBy} units
						</div>
						<div>
							Current: {getCurrencySymbol(data.currency)}
							{formatAmount(priceOverride.amount || data.amount)} / {newDivideBy} units
						</div>
					</div>
				);
			}
		}

		// Handle tier changes
		if (priceOverride.tiers && data.billing_model === BILLING_MODEL.TIERED) {
			const tierDisplay = formatPriceDisplay(
				priceOverride.amount || data.amount,
				data.currency,
				BILLING_MODEL.TIERED,
				undefined,
				priceOverride.tiers,
			);
			return (
				<div>
					<div>Original: {originalDisplay}</div>
					<div>Current: {tierDisplay}</div>
				</div>
			);
		}

		// If we have any override but couldn't determine specific changes, show generic but informative message
		if (Object.keys(priceOverride).length > 0) {
			return (
				<div>
					<div>Original: {originalDisplay}</div>
					<div>Current: {overriddenDisplay || 'Modified'}</div>
				</div>
			);
		}

		return null;
	};

	const renderTieredPricingTooltip = () => {
		if (!isTiered) return null;

		const tiers = priceOverride?.tiers || data.tiers;
		if (!tiers?.length) return null;

		const formatRange = (tier: any, index: number, allTiers: any[]) => {
			// For the first tier, start from 0
			const from = index === 0 ? 0 : allTiers[index - 1]?.up_to || 0;

			// If up_to is null or this is the last tier, show infinity
			if (tier.up_to === null || tier.up_to === undefined || index === allTiers.length - 1) {
				return `${from} - ∞`;
			}

			// Otherwise show the actual range
			return `${from} - ${tier.up_to}`;
		};

		return (
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
							<div className='space-y-2'>
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
		);
	};

	// Main price display logic
	const getMainPriceDisplay = () => {
		if (priceOverride?.billing_model === BILLING_MODEL.PACKAGE && priceOverride.transform_quantity) {
			return formatPriceDisplay(
				priceOverride.amount || data.amount,
				data.currency,
				BILLING_MODEL.PACKAGE,
				priceOverride.transform_quantity,
			);
		}

		if (priceOverride?.billing_model === BILLING_MODEL.TIERED && priceOverride.tiers?.length) {
			return formatPriceDisplay(priceOverride.amount || data.amount, data.currency, BILLING_MODEL.TIERED, undefined, priceOverride.tiers);
		}

		// Handle package transform_quantity override even when billing model hasn't changed
		if (priceOverride?.transform_quantity && data.billing_model === BILLING_MODEL.PACKAGE) {
			return formatPriceDisplay(
				priceOverride.amount || data.amount,
				data.currency,
				BILLING_MODEL.PACKAGE,
				priceOverride.transform_quantity,
			);
		}

		const priceData = overriddenAmount ? { ...data, amount: overriddenAmount } : data;
		return getPriceTableCharge(priceData as any, false);
	};

	// Computed values
	const effectiveBillingModel = priceOverride?.billing_model || data.billing_model;
	const effectiveTierMode = priceOverride?.tier_mode || data.tier_mode;
	const tiers = priceOverride?.tiers || data.tiers;
	const isTiered =
		(effectiveBillingModel === BILLING_MODEL.TIERED || effectiveBillingModel === 'SLAB_TIERED') && Array.isArray(tiers) && tiers.length > 0;

	const discountInfo = !overriddenAmount && appliedCoupon ? calculateDiscountedPrice(data, appliedCoupon) : null;
	const hasOverrides =
		priceOverride &&
		(priceOverride.billing_model !== undefined ||
			priceOverride.tier_mode !== undefined ||
			priceOverride.tiers !== undefined ||
			priceOverride.quantity !== undefined ||
			priceOverride.transform_quantity !== undefined);

	return (
		<div className='flex items-center gap-2'>
			{/* Discounted Price Display */}
			{discountInfo ? (
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
				/* Main Price Display */
				<div>{getMainPriceDisplay()}</div>
			)}

			{/* Override Indicator Tooltip */}
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
								<div className='text-sm text-gray-600'>{renderOverrideTooltip()}</div>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			{/* Tiered Pricing Tooltip */}
			{renderTieredPricingTooltip()}
		</div>
	);
};

export default ChargeValueCell;
