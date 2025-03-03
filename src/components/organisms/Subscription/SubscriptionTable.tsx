import { FC } from 'react';
import { Subscription } from '@/models/Subscription';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import formatChips from '@/utils/common/format_chips';
import { Chip } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import formatDate from '@/utils/common/format_date';

export interface SubscriptionTableProps {
	customerId: string;
	data: Subscription[];
	onRowClick?: (row: Subscription) => void;
}

const SubscriptionTable: FC<SubscriptionTableProps> = ({ data, onRowClick }) => {
	const mappedData = (data ?? []).map((subscription) => ({
		id: subscription.id,
		plan_name: subscription.plan?.name,
		status: subscription.status,
		start_date: subscription.start_date,
		end_date: subscription.end_date,
		billing_period: subscription.billing_period,
	}));

	const columns: ColumnData[] = [
		{
			fieldName: 'plan_name',
			title: 'Plan Name',
			fieldVariant: 'title',
		},
		{
			title: 'Billing Period',
			render: (row) => <span>{toSentenceCase(row.billing_period)}</span>,
		},
		{
			title: 'Status',

			render: (row) => {
				const label = formatChips(row.status);
				return <Chip variant={label === 'Active' ? 'success' : 'default'} label={label} />;
			},
		},
		{
			title: 'Start Date',
			render: (row) => <span>{formatDate(row.start_date)}</span>,
		},
	];

	return (
		<FlexpriceTable
			onRowClick={(row) => {
				onRowClick?.(row);
			}}
			columns={columns}
			data={mappedData}
		/>
	);
};

export default SubscriptionTable;
