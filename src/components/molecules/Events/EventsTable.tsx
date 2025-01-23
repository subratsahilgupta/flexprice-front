import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import formatDate from '@/utils/common/format_date';

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
			title: 'Name',
			fieldName: 'event_name',
		},
		{
			title: 'Customer',
			fieldName: 'customer_id',
		},
		{
			title: 'External Customer ID',
			fieldName: 'external_customer_id',
		},
		{
			title: 'Source',
			fieldName: 'source',
		},
		{
			title: 'Timestamp',
			fieldName: 'timestamp',
			render(rowData) {
				return <span>{formatDate(rowData.timestamp)}</span>;
			},
		},
	];
	return (
		<div>
			<FlexpriceTable columns={columns} data={data} />
		</div>
	);
};

export default EventsTable;
