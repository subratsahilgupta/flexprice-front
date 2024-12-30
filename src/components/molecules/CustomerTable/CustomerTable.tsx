import { FC } from 'react';
import { Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import ActionButton from './ActionButton';
import { Plan } from '@/models/Plan';
import formatDate from '@/utils/common/format_date';
import formatChips from '@/utils/common/format_chips';

export interface Props {
	data: Plan[];
}

const CustomerTable: FC<Props> = ({ data }) => {
	const mappedData = data.map((plan) => ({
		...plan,
	}));
	const columns: ColumnData[] = [
		{ name: 'name', title: 'Name', width: '700px' },
		{ name: 'created_by', title: 'Created by' },
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
				return <span className='text-[#09090B] '>{formatDate(row.updated_at)}</span>;
			},
		},
		{
			name: 'actions',
			title: '',
			redirect: false,
			render: (row) => <ActionButton id={row.id} />,
		},
	];

	return <FlexpriceTable redirectUrl='/customer-management/pricing-plan/edit-plan?id=' columns={columns} data={mappedData} />;
};

export default CustomerTable;
