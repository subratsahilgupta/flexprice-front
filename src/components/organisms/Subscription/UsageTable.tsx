import { FC } from 'react';
import { SubscriptionUsage } from '@/models/Subscription';
import { ColumnData, FlexpriceTable } from '@/components/molecules';

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
		},
		{
			name: 'amount',
			title: 'Amount',
		},
	];

	return (
		<div className='rounded-xl border border-gray-300 space-y-6 mt-2'>
			<FlexpriceTable columns={columns} data={mappedData} />
		</div>
	);
};

export default UsageTable;
