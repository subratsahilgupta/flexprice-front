import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { Plan } from '@/models/Plan';
import formatChips from '@/utils/common/format_chips';
import formatDate from '@/utils/common/format_date';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { RouteNames } from '@/core/routes/Routes';

export interface PlansTableProps {
	data: Plan[];
}

const PlansTable: FC<PlansTableProps> = ({ data }) => {
	const mappedData = data?.map((plan) => ({
		...plan,
	}));

	const columns: ColumnData[] = [
		{ fieldName: 'name', title: 'Name', width: '700px' },
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
			fieldName: 'updated_at',
			title: 'Updated at',
			render: (row) => {
				return <span className='text-[#09090B]'>{formatDate(row.updated_at)}</span>;
			},
		},
		{
			fieldName: 'actions',
			title: '',
			redirect: false,
			render: (row) => (
				<ActionButton
					id={row.id}
					isArchiveDisabled={true}
					isEditDisabled={true}
					// isArchiveDisabled={row.status === 'archived' || false}
					// isEditDisabled={row.status === 'archived' || false}
					editPath={`/product-catalog/pricing-plan/edit-plan?id=${row.id}`}
					deleteMutationFn={(id) => PlanApi.deletePlan(id)}
					refetchQueryKey='fetchPlans'
					entityName='Plan'
				/>
			),
		},
	];

	return <FlexpriceTable redirectUrl={RouteNames.pricingPlan + '/'} columns={columns} data={mappedData} />;
};

export default PlansTable;
