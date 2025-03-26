import { FC } from 'react';
import { Subscription } from '@/models/Subscription';
import { ColumnData, FlexpriceTable, RedirectCell } from '@/components/molecules';
import { Chip } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import formatDate from '@/utils/common/format_date';
import SubscriptionActionButton from './SubscriptionActionButton';
import { RouteNames } from '@/core/routes/Routes';

export interface SubscriptionTableProps {
	customerId: string;
	data: Subscription[];
	onRowClick?: (row: Subscription) => void;
}

export const getSubscriptionStatus = (status: string) => {
	switch (status.toUpperCase()) {
		case 'ACTIVE':
			return <Chip variant='success' label='Active' />;
		case 'PAUSED':
			return <Chip variant='warning' label='Paused' />;
		case 'CANCELLED':
			return <Chip variant='failed' label='Cancelled' />;
		default:
			return <Chip variant='default' label='Inactive' />;
	}
};

export const formatSubscriptionStatus = (status: string) => {
	switch (status.toUpperCase()) {
		case 'ACTIVE':
			return 'Active';
		case 'PAUSED':
			return 'Paused';
		case 'CANCELLED':
			return 'Cancelled';
		default:
			return 'Inactive';
	}
};

const SubscriptionTable: FC<SubscriptionTableProps> = ({ data, onRowClick }) => {
	const columns: ColumnData<Subscription>[] = [
		{
			title: 'Plan Name',
			fieldVariant: 'title',
			render: (row) => <RedirectCell redirectUrl={`${RouteNames.plan}/${row.plan?.id}`}>{row.plan?.name}</RedirectCell>,
		},
		{
			title: 'Billing Period',
			render: (row) => <span>{toSentenceCase(row.billing_period)}</span>,
		},
		{
			title: 'Status',
			render: (row) => getSubscriptionStatus(row.subscription_status),
		},
		{
			title: 'Start Date',
			render: (row) => <span>{formatDate(row.start_date)}</span>,
		},
		{
			width: '30px',
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row) => <SubscriptionActionButton subscription={row} />,
		},
	];

	return (
		<FlexpriceTable
			onRowClick={(row) => {
				onRowClick?.(row);
			}}
			columns={columns}
			data={data}
		/>
	);
};

export default SubscriptionTable;
