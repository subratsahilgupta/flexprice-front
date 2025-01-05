import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { Plan } from '@/models/Plan';
import formatChips from '@/utils/common/format_chips';
import formatDate from '@/utils/common/format_date';
import { PlanApi } from '@/utils/api_requests/PlanApi';

export interface PlansTableProps {
	data: Plan[];
}

const PlansTable: FC<PlansTableProps> = ({ data }) => {
	// Mapping data if additional transformations are required (currently redundant)
	const mappedData = data.map((plan) => ({
		...plan,
	}));

	// Columns definition
	const columns: ColumnData[] = [
		{ name: 'name', title: 'Name', width: '700px' },
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
			name: 'updated_at',
			title: 'Updated at',
			render: (row) => {
				return <span className='text-[#09090B]'>{formatDate(row.updated_at)}</span>;
			},
		},
		{
			name: 'actions',
			title: '',
			redirect: false,
			render: (row) => (
				<ActionButton
					id={row.id}
					editPath={`/customer-management/pricing-plan/edit-plan?id=${row.id}`}
					deleteMutationFn={(id) => PlanApi.deletePlan(id)}
					refetchQueryKey='fetchPlans'
					entityName='Plan'
				/>
			),
		},
	];

	return <FlexpriceTable redirectUrl='/customer-management/pricing-plan/edit-plan?id=' columns={columns} data={mappedData} />;
};

export default PlansTable;
