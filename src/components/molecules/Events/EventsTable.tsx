import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { formatDateWithMilliseconds } from '@/utils/common/format_date';

interface Props {
	data: Event[];
}

export interface Event {
	readonly customer_id: string;
	readonly event_name: string;
	readonly external_customer_id: string;
	readonly id: string;
	readonly properties: Record<string, any>;
	readonly source: string;
	readonly timestamp: string;
}

const EventsTable: FC<Props> = ({ data }) => {
	const columns: ColumnData[] = [
		{
			title: 'Event Id',
			fieldName: 'id',
		},
		{
			title: ' Meter name',
			fieldName: 'event_name',
		},
		{
			title: 'External Customer ID',
			fieldName: 'external_customer_id',
		},
		{
			title: 'Source',
			fieldName: 'source',
			render(rowData) {
				return <span>{rowData.source || '--'}</span>;
			},
		},
		{
			title: 'Timestamp',
			fieldName: 'timestamp',
			render(rowData) {
				return <span>{formatDateWithMilliseconds(rowData.timestamp)}</span>;
			},
		},
	];
	return (
		<div>
			<FlexpriceTable showEmptyRow columns={columns} data={data} />
		</div>
	);
};

export default EventsTable;
