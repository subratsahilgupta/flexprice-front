import { Price, PRICE_TYPE, PRICE_ENTITY_TYPE } from '@/models/Price';
import { useMemo } from 'react';
import {
	formatBillingPeriodForDisplay,
	calculateCouponDiscount,
	getCurrencySymbol,
	calculateTotalCouponDiscount,
} from '@/utils/common/helper_functions';
import { BILLING_PERIOD } from '@/constants/constants';
import { BILLING_CYCLE, SubscriptionPhase } from '@/models/Subscription';
import { INVOICE_CADENCE } from '@/models/Invoice';
import formatDate from '@/utils/common/format_date';
import { calculateAnniversaryBillingAnchor, calculateCalendarBillingAnchor } from '@/utils/helpers/subscription';
import { cn } from '@/lib/utils';
import { Calendar, Receipt } from 'lucide-react';
import TimelinePreview, { PreviewTimelineItem } from './TimelinePreview';
import { ExpandedPlan } from '@/types/plan';
import { Coupon } from '@/models/Coupon';
import { getCurrentPriceAmount } from '@/utils/common/price_override_helpers';
import { TaxRateOverride } from '@/types/dto/tax';
import { AddAddonToSubscriptionRequest } from '@/types/dto/Addon';
import { useQuery } from '@tanstack/react-query';
import AddonApi from '@/api/AddonApi';
import TaxApi from '@/api/TaxApi';
import { TaxRateResponse } from '@/types/dto/tax';
import { BaseEntityStatus } from '@/types/common';

const PERIOD_DURATION: Record<BILLING_PERIOD, string> = {
	[BILLING_PERIOD.DAILY]: '1 day',
	[BILLING_PERIOD.WEEKLY]: '1 week',
	[BILLING_PERIOD.MONTHLY]: '1 month',
	[BILLING_PERIOD.QUARTERLY]: '3 months',
	[BILLING_PERIOD.HALF_YEARLY]: '6 months',
	[BILLING_PERIOD.ANNUAL]: '1 year',
} as const;

interface PreviewProps {
	data: Price[];
	className?: string;
	selectedPlan?: ExpandedPlan | null;
	phases: SubscriptionPhase[];
	coupons?: Coupon[];
	priceOverrides?: Record<string, string>;
	lineItemCoupons?: Record<string, Coupon>;
	taxRateOverrides?: TaxRateOverride[];
	addons?: AddAddonToSubscriptionRequest[];
}

/**
 * Determines if any plan charge has ADVANCE invoice cadence (excludes addon charges)
 */
const hasAdvanceCharge = (charges: Price[]): boolean => {
	return (
		charges?.some((charge) => charge.invoice_cadence === INVOICE_CADENCE.ADVANCE && charge.entity_type === PRICE_ENTITY_TYPE.PLAN) ?? false
	);
};

/**
 * Generates billing description based on charges and billing period
 */
const getBillingDescription = (charges: Price[], billingPeriod: BILLING_PERIOD, date: Date): string => {
	const period = PERIOD_DURATION[billingPeriod] || formatBillingPeriodForDisplay(billingPeriod).toLowerCase();
	return hasAdvanceCharge(charges) ? `Bills immediately for ${period}` : `Bills on ${formatDate(date)} for ${period}`;
};

/**
 * Calculates the first invoice date based on billing cycle and period
 */
const calculateFirstInvoiceDate = (startDate: Date, billingPeriod: BILLING_PERIOD, billingCycle: BILLING_CYCLE): Date => {
	return billingCycle === BILLING_CYCLE.CALENDAR
		? calculateCalendarBillingAnchor(startDate, billingPeriod)
		: calculateAnniversaryBillingAnchor(startDate, billingPeriod);
};

/**
 * Calculates the total amount with line item coupons applied
 */
const calculateTotalWithLineItemCoupons = (
	charges: Price[],
	priceOverrides: Record<string, string>,
	lineItemCoupons: Record<string, Coupon>,
): { total: number; lineItemDiscounts: Record<string, number>; totalDiscount: number } => {
	let total = 0;
	let totalDiscount = 0;
	const lineItemDiscounts: Record<string, number> = {};

	charges.forEach((charge) => {
		const currentAmount = getCurrentPriceAmount(charge, priceOverrides);
		const chargeAmount = parseFloat(currentAmount);

		// Only apply line item coupons to FIXED charges, not USAGE/metered charges
		if (charge.type === 'FIXED') {
			const chargeCoupon = lineItemCoupons[charge.id];

			// Calculate discount for this charge
			const chargeDiscount = chargeCoupon ? calculateCouponDiscount(chargeCoupon, chargeAmount) : 0;

			lineItemDiscounts[charge.id] = chargeDiscount;
			totalDiscount += chargeDiscount;
			total += Math.max(0, chargeAmount - chargeDiscount);
		} else {
			// For usage charges, just add the amount without line item coupon discount
			total += chargeAmount;
		}
	});

	return { total, lineItemDiscounts, totalDiscount };
};

/**
 * Calculates addon total based on addon requests and their prices
 * Only considers prices with ADVANCE invoice cadence
 */
const calculateAddonTotal = (
	addons: AddAddonToSubscriptionRequest[],
	allAddons: any[],
	billingPeriod: string,
	currency: string,
): { total: number; addonDetails: Array<{ name: string; amount: number }> } => {
	let total = 0;
	const addonDetails: Array<{ name: string; amount: number }> = [];

	addons.forEach((addonRequest) => {
		const addon = allAddons.find((a) => a.id === addonRequest.addon_id);
		if (addon?.prices) {
			// Find the price that matches the billing period, currency, and is an ADVANCE charge
			const matchingPrice = addon.prices.find(
				(price: Price) =>
					price.billing_period.toLowerCase() === billingPeriod.toLowerCase() &&
					price.currency.toLowerCase() === currency.toLowerCase() &&
					price.type === 'FIXED' &&
					price.invoice_cadence === INVOICE_CADENCE.ADVANCE,
			);

			if (matchingPrice) {
				const amount = parseFloat(matchingPrice.amount);
				total += amount;
				addonDetails.push({
					name: addon.name,
					amount: amount,
				});
			}
		}
	});

	return { total, addonDetails };
};

/**
 * Calculates tax amount based on tax rate overrides and fetched tax rate data
 * Tax is calculated on the subtotal amount after discounts are applied
 */
const calculateTaxAmount = (
	subtotal: number,
	taxRateOverrides: TaxRateOverride[],
	currency: string,
	taxRates: TaxRateResponse[],
): number => {
	if (!taxRateOverrides || taxRateOverrides.length === 0) return 0;

	// Filter tax overrides for the current currency and auto-apply enabled
	const applicableTaxes = taxRateOverrides.filter((tax) => tax.currency.toLowerCase() === currency.toLowerCase() && tax.auto_apply);

	// Calculate total tax amount by matching overrides with actual tax rate data
	let totalTaxAmount = 0;

	for (const taxOverride of applicableTaxes) {
		// Find the corresponding tax rate data using the tax_rate_code
		const taxRateData = taxRates.find((rate) => rate.code === taxOverride.tax_rate_code);

		if (taxRateData) {
			// Apply percentage-based tax
			if (taxRateData.percentage_value !== undefined && taxRateData.percentage_value !== null) {
				totalTaxAmount += (taxRateData.percentage_value / 100) * subtotal;
			}
			// Apply fixed-amount tax
			else if (taxRateData.fixed_value !== undefined && taxRateData.fixed_value !== null) {
				totalTaxAmount += taxRateData.fixed_value;
			}
		} else {
			// Tax rate data not found - this could happen if the tax rate was deleted or not published
			console.warn(`Tax rate data not found for code: ${taxOverride.tax_rate_code}. Skipping tax calculation.`);
		}
	}

	return totalTaxAmount;
};

/**
 * Component that displays subscription preview information including start date and first invoice details
 * Shows only ADVANCE charges (charges that will be billed immediately)
 * Separates plan charges from addon charges to prevent double-counting
 */
const Preview = ({
	data,
	className,
	phases,
	coupons = [],
	priceOverrides = {},
	lineItemCoupons = {},
	taxRateOverrides = [],
	addons = [],
}: PreviewProps) => {
	const firstPhase = phases.at(0);
	const startDate = firstPhase?.start_date;
	const billingCycle = firstPhase?.billing_cycle || BILLING_CYCLE.ANNIVERSARY;

	// Fetch addons data for calculation
	const { data: allAddons = [] } = useQuery({
		queryKey: ['addons'],
		queryFn: async () => {
			const response = await AddonApi.ListAddon({ limit: 1000, offset: 0 });
			return response.items;
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	// Extract unique tax rate codes from overrides to fetch only needed tax rates
	const taxRateCodes = useMemo(() => {
		if (!taxRateOverrides || taxRateOverrides.length === 0) return [];
		return [...new Set(taxRateOverrides.map((override) => override.tax_rate_code))];
	}, [taxRateOverrides]);

	// Fetch tax rates data for calculation
	const { data: allTaxRates = [] } = useQuery({
		queryKey: ['publishedTaxRates', taxRateCodes],
		queryFn: async () => {
			const response = await TaxApi.listTaxRates({
				limit: 1000,
				status: BaseEntityStatus.PUBLISHED,
			});
			// Filter to only return tax rates that are referenced in the overrides
			return response.items.filter((rate) => taxRateCodes.includes(rate.code));
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		enabled: taxRateCodes.length > 0, // Only fetch if there are tax rate codes to fetch
	});

	// Filter to only show PLAN charges with ADVANCE invoice cadence (excludes addon charges to prevent double-counting)
	const recurringCharges = useMemo(
		() =>
			data.filter(
				(charge) =>
					charge.type === 'FIXED' && charge.invoice_cadence === INVOICE_CADENCE.ADVANCE && charge.entity_type === PRICE_ENTITY_TYPE.PLAN,
			),
		[data],
	);

	// Usage charges are typically billed in arrears, so we include all usage charges
	const usageCharges = useMemo(() => data.filter((charge) => charge.type === PRICE_TYPE.USAGE), [data]);

	const { total: recurringTotal, totalDiscount: lineItemTotalDiscount } = useMemo(() => {
		const result = calculateTotalWithLineItemCoupons(recurringCharges, priceOverrides, lineItemCoupons);
		return result;
	}, [recurringCharges, priceOverrides, lineItemCoupons]);

	// Calculate addon total
	const billingPeriod = useMemo(() => data[0]?.billing_period.toUpperCase() as BILLING_PERIOD, [data]);
	const currency = useMemo(() => recurringCharges[0]?.currency || 'USD', [recurringCharges]);

	const { total: addonTotal, addonDetails } = useMemo(() => {
		return calculateAddonTotal(addons, allAddons, billingPeriod, currency);
	}, [addons, allAddons, billingPeriod, currency]);

	// Calculate subscription-level coupon discount (applies only to plan, not addons)
	const subscriptionCouponDiscount = useMemo(() => {
		if (coupons.length === 0) return 0;
		return calculateTotalCouponDiscount(coupons, recurringTotal);
	}, [coupons, recurringTotal]);

	// Calculate plan subtotal after discounts (addons are separate)
	const planSubtotalAfterDiscounts = useMemo(() => {
		return Math.max(0, recurringTotal - subscriptionCouponDiscount);
	}, [recurringTotal, subscriptionCouponDiscount]);

	// Calculate subtotal after discounts (plan after discounts + addons)
	const subtotalAfterDiscounts = useMemo(() => {
		return planSubtotalAfterDiscounts + addonTotal;
	}, [planSubtotalAfterDiscounts, addonTotal]);

	// Calculate tax amount (applied to amount after discounts)
	// Tax is calculated on the final amount after discounts are applied
	const taxAmount = useMemo(() => {
		return calculateTaxAmount(subtotalAfterDiscounts, taxRateOverrides, currency, allTaxRates);
	}, [subtotalAfterDiscounts, taxRateOverrides, currency, allTaxRates]);

	// Calculate final total: subtotal after discounts + tax
	const finalTotal = useMemo(() => {
		return subtotalAfterDiscounts + taxAmount;
	}, [subtotalAfterDiscounts, taxAmount]);

	const firstInvoiceDate = useMemo(() => {
		return startDate ? calculateFirstInvoiceDate(startDate as Date, billingPeriod, billingCycle) : undefined;
	}, [billingCycle, billingPeriod, startDate]);

	const billingDescription = useMemo(() => {
		return firstInvoiceDate ? getBillingDescription(data, billingPeriod, firstInvoiceDate) : '';
	}, [data, billingPeriod, firstInvoiceDate]);

	const timelineItems = useMemo(() => {
		const items: PreviewTimelineItem[] = phases.map((phase, index) => ({
			icon: <Calendar className='h-[22px] w-[22px] text-gray-500 shrink-0' />,
			subtitle: index === 0 ? 'Subscription Start' : 'Subscription Updates',
			label: formatDate(phase.start_date),
		}));

		// Calculate total coupons and discounts
		const totalLineItemCoupons = Object.keys(lineItemCoupons).length;
		const totalCoupons = coupons.length + totalLineItemCoupons;

		// Insert first invoice preview after the first item
		const invoicePreview: PreviewTimelineItem = {
			icon: <Receipt className='h-[22px] w-[22px] text-gray-500 shrink-0' />,
			subtitle: (
				<div>
					<div className='space-y-1'>
						{/* Plan Subtotal */}
						<p className='text-sm text-gray-600'>
							Plan: {getCurrencySymbol(currency || 'USD')}
							{recurringTotal.toFixed(2)}
						</p>

						{/* Addons */}
						{addonTotal > 0 && (
							<>
								<p className='text-sm text-gray-600'>
									Addons: {getCurrencySymbol(currency || 'USD')}
									{addonTotal.toFixed(2)}
								</p>
								{addonDetails.map((addon, index) => (
									<p key={index} className='text-xs text-gray-500 ml-4'>
										• {addon.name}: {getCurrencySymbol(currency || 'USD')}
										{addon.amount.toFixed(2)}
									</p>
								))}
							</>
						)}

						{/* Discounts */}
						{totalCoupons > 0 && (
							<>
								{lineItemTotalDiscount > 0 && (
									<p className='text-sm text-blue-600'>
										Line-item discounts: -{getCurrencySymbol(currency || 'USD')}
										{lineItemTotalDiscount.toFixed(2)}
									</p>
								)}
								{subscriptionCouponDiscount > 0 && (
									<p className='text-sm text-blue-600'>
										Subscription discount: -{getCurrencySymbol(currency || 'USD')}
										{subscriptionCouponDiscount.toFixed(2)}
									</p>
								)}
							</>
						)}

						{/* Tax (calculated on discounted amount) */}
						{taxAmount > 0 && (
							<p className='text-sm text-gray-600'>
								Tax: {getCurrencySymbol(currency || 'USD')}
								{taxAmount.toFixed(2)}
							</p>
						)}

						{/* Final total */}
						<p className='text-sm text-gray-900 font-semibold border-t border-gray-200 pt-1'>
							Net payable: {getCurrencySymbol(currency || 'USD')}
							{finalTotal.toFixed(2)}
						</p>
					</div>

					{totalCoupons > 0 && (
						<p className='text-xs text-gray-500 mt-2'>
							{totalCoupons} coupon{totalCoupons > 1 ? 's' : ''} applied
							{lineItemTotalDiscount > 0 && totalLineItemCoupons > 0 && (
								<span className='ml-1'>
									({totalLineItemCoupons} line-item, {coupons.length} subscription)
								</span>
							)}
						</p>
					)}

					<p className='text-sm text-gray-600 mt-2'>{billingDescription}</p>
				</div>
			),
			label: `First invoice: ${firstInvoiceDate ? formatDate(firstInvoiceDate) : ''}`,
		};

		const updatedItems = [items[0], invoicePreview, ...items.slice(1)];

		// Add end date if it exists
		const lastPhase = phases[phases.length - 1];
		if (lastPhase.end_date) {
			updatedItems.push({
				icon: <Calendar className='h-[22px] w-[22px] text-gray-500 shrink-0' />,
				subtitle: 'Subscription ends',
				label: formatDate(lastPhase.end_date),
			});
		}

		return updatedItems;
	}, [
		phases,
		firstInvoiceDate,
		recurringCharges,
		usageCharges,
		recurringTotal,
		addonTotal,
		addonDetails,
		planSubtotalAfterDiscounts,
		billingDescription,
		coupons,
		lineItemCoupons,
		lineItemTotalDiscount,
		subscriptionCouponDiscount,
		taxAmount,
		finalTotal,
		currency,
	]);

	return (
		<div className={cn('w-full', className)}>
			<TimelinePreview items={timelineItems} />
		</div>
	);
};

export default Preview;
