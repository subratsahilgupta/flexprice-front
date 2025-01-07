import { FC, useState } from 'react';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { getPriceTableCharge, NormalizedPlan } from '@/utils/models/transformed_plan';

export type ChargesForBillingPeriod = NormalizedPlan['charges'][string];
export type ChargesForBillingPeriodOne = ChargesForBillingPeriod[0];

export interface Props {
	data: ChargesForBillingPeriod;
}

const ChargeTable: FC<Props> = ({ data }) => {
	const mappedData = (data ?? []).map((charge) => ({
		charge: charge.meter_name ? `${charge.meter_name}` : charge.name,
		quantity: charge.type === 'FIXED' ? '1' : 'pay as you go',
		price: getPriceTableCharge(charge),
	}));

	const [showAllRows, setShowAllRows] = useState(false);

	const columns: ColumnData[] = [
		{
			name: 'charge',
			title: 'Charge',
		},
		{
			name: 'quantity',
			title: 'Quantity',
		},
		{
			name: 'price',
			title: 'Price',
		},
	];

	const displayedData = showAllRows ? mappedData : mappedData.slice(0, 5);

	return (
		<div>
			<div>
				<p className='font-medium text-zinc text-[14px]'>Charges</p>
			</div>
			<div className='rounded-xl border border-gray-300 space-y-6 mt-2'>
				<FlexpriceTable columns={columns} data={displayedData} redirectUrl={`/customer-management/customers/details/`} />
			</div>
			{mappedData.length > 5 && (
				<div className='text-center mt-4'>
					<button className='text-blue-600 font-semibold hover:underline' onClick={() => setShowAllRows((prev) => !prev)}>
						{showAllRows ? 'Collapse' : 'Expand'}
					</button>
				</div>
			)}
		</div>
	);
};

export default ChargeTable;
