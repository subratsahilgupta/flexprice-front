import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import formatDate from '@/utils/common/format_date';
import formatChips from '@/utils/common/format_chips';
import { Subscription, SUBSCRIPTION_CANCELLATION_TYPE, SUBSCRIPTION_STATUS } from '@/models/Subscription';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';
import SubscriptionApi from '@/api/SubscriptionApi';

interface Props {
	data: Subscription[];
	onEdit?: (subscription: Subscription) => void;
}

const SubscriptionTable: FC<Props> = ({ data, onEdit }) => {
	const navigate = useNavigate();

	const columns: ColumnData<Subscription>[] = [
		{
			title: 'Customer',
			render: (row) => row.customer?.name || row.customer_id,
		},
		{
			title: 'Plan',
			render: (row) => row.plan?.name || row.plan_id,
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
			render: (row) => formatDate(row.start_date),
		},
		{
			title: 'Updated At',
			render: (row) => formatDate(row.updated_at),
		},
		{
			fieldVariant: 'interactive',
			render: (row) => (
				<ActionButton
					isArchiveDisabled={row.subscription_status === SUBSCRIPTION_STATUS.CANCELLED}
					isEditDisabled={row.subscription_status === SUBSCRIPTION_STATUS.CANCELLED}
					entityName='Subscription'
					refetchQueryKey='fetchSubscriptions'
					deleteMutationFn={(id) =>
						SubscriptionApi.cancelSubscription(id, {
							cancellation_type: SUBSCRIPTION_CANCELLATION_TYPE.IMMEDIATE,
						})
					}
					editPath={`${RouteNames.subscriptions}/edit/${row.id}`}
					onEdit={() => {
						onEdit?.(row);
					}}
					id={row.id}
				/>
			),
		},
	];

	return (
		<FlexpriceTable
			showEmptyRow
			columns={columns}
			data={data}
			onRowClick={(row) => {
				navigate(`${RouteNames.subscriptions}/${row?.id}`);
			}}
		/>
	);
};

export default SubscriptionTable;
