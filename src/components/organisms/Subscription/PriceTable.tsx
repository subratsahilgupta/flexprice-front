import { FC, useState, useMemo } from 'react';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { Price } from '@/models/Price';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { FormHeader } from '@/components/atoms';
import { motion } from 'framer-motion';
import ChargeValueCell from '@/pages/product-catalog/plans/ChargeValueCell';
import { capitalize } from 'es-toolkit';

export interface Props {
	data: Price[];
	billingPeriod?: string;
	currency?: string;
}

type ChargeTableData = {
	charge: string;
	quantity: string;
	price: JSX.Element;
	invoice_cadence: string;
};

const PriceTable: FC<Props> = ({ data, billingPeriod, currency }) => {
	const [showAllRows, setShowAllRows] = useState(false);

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

	const mappedData: ChargeTableData[] = (filteredPrices ?? []).map((price) => ({
		charge: price.meter?.name ? `${price.meter.name}` : price.description || 'Charge',
		quantity: price.type === 'FIXED' ? '1' : 'pay as you go',
		price: <ChargeValueCell data={{ ...price, currency: price.currency } as any} />,
		invoice_cadence: price.invoice_cadence,
	}));

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
		</div>
	);
};

export default PriceTable;
