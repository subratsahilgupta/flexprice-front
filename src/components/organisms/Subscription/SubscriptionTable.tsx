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
	redirectUrl?: string;
	onRowClick?: (row: any) => void;
}

const SubscriptionTable: FC<SubscriptionTableProps> = ({ data, onRowClick, redirectUrl }) => {
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
		},
		{
			fieldName: 'billing_period',
			title: 'Billing Period',
			render: (row) => <span>{toSentenceCase(row.billing_period)}</span>,
		},
		{
			fieldName: 'status',
			title: 'Status',
			align: 'center',
			render: (row) => {
				const label = formatChips(row.status);
				return <Chip isActive={label === 'Active'} label={label} />;
			},
		},
		{
			fieldName: 'start_date',
			title: 'Start Date',
			render: (row) => <span>{formatDate(row.start_date)}</span>,
		},
	];

	return <FlexpriceTable redirectUrl={redirectUrl} onRowClick={onRowClick} columns={columns} data={mappedData} />;
};

export default SubscriptionTable;
