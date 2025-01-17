import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { Meter } from '@/models/Meter';
import formatChips from '@/utils/common/format_chips';
import formatDate from '@/utils/common/format_date';
import { MeterApi } from '@/utils/api_requests/MeterApi';

const formatAggregationType = (data: string): string => {
	switch (data) {
		case 'SUM':
			return 'Sum';
		case 'COUNT':
			return 'Count';
		default:
			return 'Sum';
	}
};

export interface BillableMetricTableProps {
	data: Meter[];
}

const BillableMetricTable: FC<BillableMetricTableProps> = ({ data }) => {
	const mappedData = data?.map((meter) => ({
		...meter,
		aggregation_type: meter.aggregation.type,
		aggregation_field: meter.aggregation.field,
	}));
	const columns: ColumnData[] = [
		{ name: 'event_name', title: 'Event Name', width: '400px' },
		{
			name: 'aggregation_type',
			title: 'Aggregate Type',
			align: 'center',
			render: (row) => {
				return <span className='text-[#09090B] '>{formatAggregationType(row.aggregation_type)}</span>;
			},
		},
		{ name: 'aggregation_field', title: 'Aggregate Value', align: 'center' },
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
			render: (row) => (
				<ActionButton
					id={row.id}
					editPath={`/usage-tracking/billable-metric/edit-meter?id=${row.id}`}
					deleteMutationFn={(id) => MeterApi.deleteMeter(id)}
					refetchQueryKey={'fetchMeters'}
					entityName={'Meter'}
				/>
			),
		},
	];

	return <FlexpriceTable redirectUrl='/usage-tracking/billable-metric/edit-meter?id=' columns={columns} data={mappedData} />;
};

export default BillableMetricTable;
