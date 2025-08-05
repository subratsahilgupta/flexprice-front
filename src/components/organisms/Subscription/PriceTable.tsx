import { FC, useState, useMemo } from 'react';
import { ColumnData, FlexpriceTable, PriceOverrideDialog } from '@/components/molecules';
import { Price, BILLING_MODEL } from '@/models/Price';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { FormHeader, ActionButton } from '@/components/atoms';
import { motion } from 'framer-motion';
import ChargeValueCell from '@/pages/product-catalog/plans/ChargeValueCell';
import { capitalize } from 'es-toolkit';

export interface Props {
	data: Price[];
	billingPeriod?: string;
	currency?: string;
	onPriceOverride?: (priceId: string, newAmount: string) => void;
	onResetOverride?: (priceId: string) => void;
	overriddenPrices?: Record<string, string>;
}

type ChargeTableData = {
	charge: string;
	quantity: string;
	price: JSX.Element;
	invoice_cadence: string;
	actions?: JSX.Element;
};

const PriceTable: FC<Props> = ({ data, billingPeriod, currency, onPriceOverride, onResetOverride, overriddenPrices = {} }) => {
	const [showAllRows, setShowAllRows] = useState(false);
	const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Filter prices based on billing period and currency if provided
	const filteredPrices = useMemo(() => {
		let filtered = data;

		if (billingPeriod) {
			filtered = filtered.filter((price) => price.billing_period.toLowerCase() === billingPeriod.toLowerCase());
		}

		if (currency) {
			filtered = filtered.filter((price) => price.currency.toLowerCase() === currency.toLowerCase());
		}

		return filtered;
	}, [data, billingPeriod, currency]);

	const handleOverride = (price: Price) => {
		setSelectedPrice(price);
		setIsDialogOpen(true);
	};

	const mappedData: ChargeTableData[] = (filteredPrices ?? []).map((price) => {
		const isOverridable = price.billing_model === BILLING_MODEL.FLAT_FEE || price.billing_model === BILLING_MODEL.PACKAGE;
		const isOverridden = overriddenPrices[price.id] !== undefined;

		return {
			charge: price.meter?.name ? `${price.meter.name}` : price.description || 'Charge',
			quantity: price.type === 'FIXED' ? '1' : 'pay as you go',
			price: (
				<ChargeValueCell
					data={{ ...price, currency: price.currency } as any}
					overriddenAmount={isOverridden ? overriddenPrices[price.id] : undefined}
				/>
			),
			invoice_cadence: price.invoice_cadence,
			actions: isOverridable ? (
				<ActionButton
					editText={'Override Price'}
					id={price.id}
					deleteMutationFn={() => Promise.resolve()}
					refetchQueryKey='prices'
					entityName={price.meter?.name || price.description || 'Charge'}
					isEditDisabled={false}
					isArchiveDisabled={true}
					onEdit={() => handleOverride(price)}
				/>
			) : undefined,
		};
	});

	const columns: ColumnData<ChargeTableData>[] = [
		{
			fieldName: 'charge',
			title: 'Charge',
		},
		{
			title: 'Billing Period',
			render: (data) => {
				return capitalize(data.invoice_cadence) || '--';
			},
		},
		{
			fieldName: 'quantity',
			title: 'Quantity',
		},
		{
			fieldName: 'price',
			title: 'Price',
		},
		{
			fieldName: 'actions',
			title: '',
			width: 50,
			align: 'center',
			fieldVariant: 'interactive',
			hideOnEmpty: true,
		},
	];

	const displayedData = showAllRows ? mappedData : mappedData.slice(0, 5);

	return (
		<div>
			<div>
				<FormHeader title='Charges' variant='sub-header' />
			</div>
			<div className='rounded-xl border border-gray-300 space-y-6 mt-2 '>
				<motion.div
					initial={{ height: 'auto' }}
					// animate={{ height: showAllRows ? 'auto' : 200 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					style={{ overflow: 'hidden' }}>
					<FlexpriceTable columns={columns} data={displayedData} />
				</motion.div>
			</div>
			{mappedData.length > 5 && (
				<div className='text-center mt-4 w-full flex justify-center'>
					<span className='flex items-center gap-1 text-xs duration-300 transition-all' onClick={() => setShowAllRows((prev) => !prev)}>
						{showAllRows ? (
							<>
								<ChevronUpIcon className='w-4 h-4' />
							</>
						) : (
							<>
								<ChevronDownIcon className='w-4 h-4' />
							</>
						)}
					</span>
				</div>
			)}

			{/* Price Override Dialog */}
			{selectedPrice && (
				<PriceOverrideDialog
					isOpen={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					price={selectedPrice}
					onPriceOverride={onPriceOverride || (() => {})}
					onResetOverride={onResetOverride || (() => {})}
					overriddenPrices={overriddenPrices}
				/>
			)}
		</div>
	);
};

export default PriceTable;
