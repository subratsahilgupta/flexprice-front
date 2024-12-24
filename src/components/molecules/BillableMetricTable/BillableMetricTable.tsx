import ActionButton from './ActionButton';
import { FC } from 'react';
import { Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';

export interface BillableMetric {
	eventName: string;
	aggregateType: string;
	aggregateValue: string;
	status: string;
	updatedAt: Date;
	_id: string;
}

const formatDate = (date: Date): string => {
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
	return new Date(date).toLocaleDateString('en-US', options);
};

export interface BillableMetricTableProps {
	data: BillableMetric[];
}

const BillableMetricTable: FC<BillableMetricTableProps> = ({ data }) => {
	const columns: ColumnData[] = [
		{ name: 'eventName', title: 'Event Name', width: '400px' },
		{ name: 'aggregateType', title: 'Aggregate Type', align: 'center' },
		{ name: 'aggregateValue', title: 'Aggregate Value', align: 'center' },
		{
			name: 'status',
			title: 'Status',
			align: 'center',
			render: (row) => <Chip isActive={row.status === 'Active'} label={row.status} />,
		},
		{
			name: 'updatedAt',
			title: 'Updated At',
			render: (row) => <span className='text-[#09090B] '>{formatDate(row.updatedAt)}</span>,
		},
		{
			name: 'actions',
			title: '',
			render: () => <ActionButton />,
		},
	];

	return <FlexpriceTable columns={columns} data={data} />;
};

export default BillableMetricTable;
