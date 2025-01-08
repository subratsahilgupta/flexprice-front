import { FC } from 'react';
import { SubscriptionUsage } from '@/models/Subscription';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { FormHeader } from '@/components/atoms';

export interface UsageTableProps {
	data: SubscriptionUsage;
}

const UsageTable: FC<UsageTableProps> = ({ data }) => {
	const mappedData = (data?.charges ?? []).map((usage) => ({
		name: usage.meter_display_name,
		quantity: usage.quantity,
		amount: usage.display_amount,
	}));

	const columns: ColumnData[] = [
		{
			name: 'name',
			title: 'Meter Name',
		},
		{
			name: 'quantity',
			title: 'Quantity',
			align: 'center',
		},
		{
			name: 'amount',
			title: 'Amount',
			align: 'center',
		},
	];

	if (mappedData.length === 0) {
		return <div></div>;
	}

	return (
		<div className='rounded-xl border border-gray-300  mt-2 p-4'>
			<FormHeader title='Current Meter Usage' variant='sub-header' />
			<div className='rounded-xl border border-gray-300  mt-2 '>
				<FlexpriceTable columns={columns} data={mappedData} />
			</div>
		</div>
	);
};

export default UsageTable;
