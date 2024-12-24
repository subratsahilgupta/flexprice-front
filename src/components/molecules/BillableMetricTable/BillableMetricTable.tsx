import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ActionButton from './ActionButton';
import { FC } from 'react';
import { Chip } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface BillableMetric {
	eventName: string;
	aggregateType: string;
	aggregateValue: string;
	status: string;
	updatedAt: Date;
	_id: string;
}

export interface BillableMetricTableProps {
	data: BillableMetric[];
}

const BillableMetricTable: FC<BillableMetricTableProps> = ({ data }) => {
	const headerStyle = 'text-[#64748B] text-[14px] font-medium  ';
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className={cn(headerStyle)}>Event Name</TableHead>
					<TableHead className={cn(headerStyle)}>Aggregate Type</TableHead>
					{/* <TableHead className={cn(headerStyle)}>Aggregate Value</TableHead> */}
					<TableHead className={cn(headerStyle)}>Status</TableHead>
					<TableHead className={cn(headerStyle)}>Updated at</TableHead>
					<TableHead className={cn(headerStyle)}></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((item) => (
					<TableRow>
						<TableCell className='font-medium '>{item.eventName}</TableCell>
						<TableCell>{item.aggregateType}</TableCell>
						{/* <TableCell>{item.aggregateValue}</TableCell> */}
						<TableCell className=' '>
							<Chip isActive={item.status === 'Active'} label={item.status} />
						</TableCell>
						<TableCell>{item.updatedAt.toLocaleDateString()}</TableCell>
						<TableCell className='w-[50px] justify-center items-center'>
							<ActionButton />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default BillableMetricTable;
