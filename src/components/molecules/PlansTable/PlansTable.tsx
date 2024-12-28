import { FC } from 'react';
import { Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import ActionButton from './ActionButton';
import { Plan } from '@/models/Plan';

const formatChips = (data: string): string => {
	switch (data) {
		case 'published':
			return 'Active';
		case 'unpublished':
			return 'Inactive';
		default:
			return 'Active';
	}
};

const formatDate = (date: string, locale: string = 'en-US'): string => {
	const parsedDate = new Date(date);

	if (isNaN(parsedDate.getTime())) {
		return 'Invalid Date';
	}

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};

	return parsedDate.toLocaleDateString(locale, options);
};

export interface PlansTableProps {
	data: Plan[];
}

const PlansTable: FC<PlansTableProps> = ({ data }) => {
	const mappedData = data.map((plan) => ({
		...plan,
	}));
	const columns: ColumnData[] = [
		{ name: 'name', title: 'Name', width: '700px' },
		// { name: 'aggregation_field', title: 'Billing Model', align: 'center' },
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
			title: 'Updated At',
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

export default PlansTable;
