import { FC, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'es-toolkit';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { Checkbox, FormHeader, Chip } from '@/components/atoms';
import { formatAmount } from '@/components/atoms/Input/Input';
import { Price, PRICE_TYPE, PRICE_UNIT_TYPE } from '@/models';
import { BILLING_PERIOD } from '@/constants/constants';
import { cadenceFanoutCount } from '@/utils/subscription/cadenceCompatibility';
import { formatBillingPeriodForPrice, getCurrencySymbol } from '@/utils/common/helper_functions';

interface Props {
	/** Additional-cadence prices from `partitionPricesForSubscription(...).additional`. */
	prices: Price[];
	/** Currently opted-in price IDs (subset of `prices.map(p => p.id)`). */
	optedInIds: string[];
	/** Called when the user toggles a checkbox. */
	onToggle: (priceId: string, included: boolean) => void;
	/** Subscription cadence — required for the fan-out hint. */
	subPeriod: BILLING_PERIOD;
	/** Subscription cadence count — required for the fan-out hint. */
	subCount: number;
	disabled?: boolean;
}

type Row = {
	priceId: string;
	include: ReactNode;
	charge: ReactNode;
	billing_period: ReactNode;
	price: ReactNode;
};

function formatPriceForRow(p: Price): string {
	const currency = p.price_unit_type === PRICE_UNIT_TYPE.CUSTOM ? p.price_unit_config?.price_unit : (p as { currency?: string }).currency;
	const symbol = currency ? getCurrencySymbol(currency) : '';
	const amount = p.amount ?? p.price_unit_config?.amount ?? '0';
	const period = p.billing_period ? formatBillingPeriodForPrice(p.billing_period) : '';
	return `${symbol}${formatAmount(amount)}${period ? ` / ${period}` : ''}`;
}

/**
 * Opt-in section for finer-cadence plan prices that would fan out on the subscription's
 * invoice. Rendered only when the partition helper returns at least one additional price.
 * Selection state lives on the parent's `SubscriptionFormState.optedInAdditionalPriceIds`.
 */
const AdditionalPlanPricesSection: FC<Props> = ({ prices, optedInIds, onToggle, subPeriod, subCount, disabled = false }) => {
	const { t } = useTranslation('customers');
	const optedInSet = useMemo(() => new Set(optedInIds), [optedInIds]);

	const columns = useMemo<ColumnData<Row>[]>(
		() => [
			{ fieldName: 'include', title: '', width: 40, align: 'center', fieldVariant: 'interactive' },
			{ fieldName: 'charge', title: t('organisms.subscriptionPriceTable.colCharge') },
			{ fieldName: 'billing_period', title: t('organisms.subscriptionPriceTable.colBillingPeriod') },
			{ fieldName: 'price', title: t('organisms.subscriptionPriceTable.colPrice') },
		],
		[t],
	);

	const rows = useMemo<Row[]>(() => {
		return prices.map((price) => {
			const fanout = cadenceFanoutCount(subPeriod, subCount, price.billing_period, price.billing_period_count);
			const isChecked = optedInSet.has(price.id);
			return {
				priceId: price.id,
				include: (
					<div data-interactive='true' onClick={(e) => e.stopPropagation()}>
						<Checkbox
							id={`additional-price-${price.id}`}
							checked={isChecked}
							disabled={disabled}
							onCheckedChange={(next) => onToggle(price.id, !!next)}
						/>
					</div>
				),
				charge: (
					<div>
						<div>{price.display_name || price.meter?.name || t('organisms.subscriptionPriceTable.chargeFallback')}</div>
						{fanout != null && fanout > 1 && (
							<div className='text-xs text-content-muted mt-0.5'>
								{t('organisms.subscriptionPriceTable.fanoutHint', { count: fanout })}
							</div>
						)}
					</div>
				),
				billing_period: <Chip label={capitalize(String(price.billing_period))} variant='default' />,
				price: (
					<span>{price.type === PRICE_TYPE.FIXED ? formatPriceForRow(price) : t('organisms.subscriptionPriceTable.payAsYouGo')}</span>
				),
			};
		});
	}, [prices, optedInSet, subPeriod, subCount, disabled, onToggle, t]);

	if (prices.length === 0) return null;

	return (
		<div className='space-y-3'>
			<div>
				<FormHeader title={t('organisms.additionalPlanPrices.title')} variant='sub-header' />
				<p className='text-xs text-content-muted mt-1'>{t('organisms.additionalPlanPrices.explainer')}</p>
			</div>
			<div className='rounded-[6px] border border-line-strong'>
				<div style={{ overflow: 'hidden' }}>
					<FlexpriceTable columns={columns} data={rows} />
				</div>
			</div>
		</div>
	);
};

export default AdditionalPlanPricesSection;
