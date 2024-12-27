import ActionButton from './ActionButton';
import { FC } from 'react';
import { Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { Meter } from '@/utils/api_requests/MeterApi';

const formatChips = (data: string): string => {
	switch (data) {
		case 'published':
			return 'active';
		case 'unpublished':
			return 'inactive';
		default:
			return 'active';
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

export interface BillableMetricTableProps {
	data: Meter[];
}

const BillableMetricTable: FC<BillableMetricTableProps> = ({ data }) => {
	const mappedData = data.map((meter) => ({
		...meter,
		aggregation_type: meter.aggregation.type,
		aggregation_field: meter.aggregation.field,
	}));
	const columns: ColumnData[] = [
		{ name: 'event_name', title: 'Event Name', width: '400px' },
		{ name: 'aggregation_type', title: 'Aggregate Type', align: 'center' },
		{ name: 'aggregation_field', title: 'Aggregate Value', align: 'center' },
		{
			name: 'status',
			title: 'Status',
			align: 'center',
			render: (row) => {
				const label = formatChips(row.status);
				return <Chip isActive={label === 'active'} label={label} />;
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

	return <FlexpriceTable redirectUrl='/usage-tracking/billable-metric/edit-meter?id=' columns={columns} data={mappedData} />;
};

export default BillableMetricTable;
