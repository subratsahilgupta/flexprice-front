import { FC } from 'react';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { NormalizedPlan } from '@/utils/models/transformed_plan';

type ChargesForBillingPeriod = NormalizedPlan['charges'][string];

export interface Props {
	data: ChargesForBillingPeriod;
}

const ChargeTable: FC<Props> = ({ data }) => {
	const mappedData = (data ?? []).map((charge) => ({
		charge: charge.meter_name ? `${charge.name}/${charge.meter_name}` : charge.name,
		quantity: charge.type === 'FIXED' ? '1' : 'pay as you go',
		price:
			charge.billing_model === 'PACKAGE'
				? `${charge.display_amount}/unit/${charge.billing_period}`
				: `${charge.display_amount}/${charge.billing_period}`,
	}));

	console.log('Mapped Data', mappedData);
	const columns: ColumnData[] = [
		{
			name: 'charge',
			title: 'Charge',
			width: '400px',

			// render: (row) => {
			//     return (
			//         <span className='text-[#09090B] '>{formatDate(row.updated_at)}</span>
			//     )
			// }
		},
		{
			name: 'quantity',
			title: 'Quantity',
			// render: (row) => {
			//     return <span className='text-[#09090B] '>{formatDate(row.updated_at)}</span>;
			// },
		},
		{
			name: 'price',
			title: 'Price',
			// render: (row) => {
			//     return <span className='text-[#09090B] '>{formatDate(row.updated_at)}</span>;
			// },
		},
	];

	return (
		<div>
			<div>
				<p className='font-bold text-zinc text-[20px]'>Charges</p>
			</div>
			<div className='rounded-xl border border-gray-300 space-y-6 mt-5'>
				<FlexpriceTable columns={columns} data={mappedData} redirectUrl={`/customer-management/customers/details/`} />
			</div>
		</div>
	);
};

export default ChargeTable;
