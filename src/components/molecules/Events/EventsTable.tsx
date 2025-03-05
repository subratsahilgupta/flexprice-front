import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { formatDateWithMilliseconds } from '@/utils/common/format_date';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
			render(rowData) {
				const copyToClipboard = () => {
					navigator.clipboard.writeText(rowData.id);
					toast.success('Event ID copied to clipboard');
				};

				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className='flex items-center gap-2 group'>
									<span className='max-w-[100px] truncate cursor-pointer'>{rowData.id || '--'}</span>
									<Copy
										onClick={copyToClipboard}
										className='w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer text-muted-foreground hover:text-foreground transition-opacity'
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>{rowData.id}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			},
		},
		{
			title: 'Events name',
			render(rowData) {
				return <span>{rowData.event_name || '--'}</span>;
			},
		},
		{
			title: 'External Customer ID',
			fieldName: 'external_customer_id',
		},
		{
			title: 'Source',
			render(rowData) {
				return <span>{rowData.source || '--'}</span>;
			},
		},
		{
			title: 'Timestamp',
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
