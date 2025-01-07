import { FC } from 'react';
import { Subscription } from '@/models/Subscription';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import formatChips from '@/utils/common/format_chips';
import { Chip } from '@/components/atoms';

export interface SubscriptionTableProps {
	customerId: string;
	data: Subscription[];
}

const SubscriptionTable: FC<SubscriptionTableProps> = ({ customerId, data }) => {
	const mappedData = (data ?? []).map((subscription) => ({
		id: subscription.id,
		plan_name: subscription.plan.name,
		status: subscription.status,
		start_date: subscription.start_date,
		end_date: subscription.end_date,
		billing_period: subscription.billing_period,
	}));

	const columns: ColumnData[] = [
		{
			name: 'plan_name',
			title: 'Plan Name',
		},
		{
			name: 'billing_period',
			title: 'Billing Period',
		},
		{
			name: 'status',
			title: 'Status',
			align: 'center',
			render: (row) => {
				const label = formatChips(row.status);
				return <Chip isActive={label === 'Active'} label={label} />;
			},
		},
		{
			name: 'start_date',
			title: 'Start Date',
		},
	];

	return <FlexpriceTable columns={columns} data={mappedData} redirectUrl={`/customer-management/customers/${customerId}/subscription/`} />;
};

export default SubscriptionTable;
