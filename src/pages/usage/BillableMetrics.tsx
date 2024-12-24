import { Button, SectionHeader } from '@/components/atoms';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';
import { FiFolderPlus } from 'react-icons/fi';
import { BillableMetricTable } from '@/components/molecules';
import { BillableMetric } from '@/components/molecules/BillableMetricTable';

const BillableMetricsPage = () => {
	const dummyData: BillableMetric[] = [
		{
			eventName: 'Event 1',
			aggregateType: 'Sum',
			aggregateValue: '100',
			status: 'Active',
			updatedAt: new Date(),
			_id: '1',
		},
		{
			eventName: 'Event 2',
			aggregateType: 'Average',
			aggregateValue: '50',
			status: 'Inactive',
			updatedAt: new Date(),
			_id: '2',
		},
		{
			eventName: 'Event 3',
			aggregateType: 'Count',
			aggregateValue: '200',
			status: 'Active',
			updatedAt: new Date(),
			_id: '3',
		},
	];

	return (
		<div className='flex flex-col h-screen'>
			<SectionHeader title='Billable Metric'>
				<div className='flex gap-2 w-full'>
					<button className='px-2 py-1'>
						<IoSearch className='size-5 ' />
					</button>
					<button className='px-2 py-1'>
						<LiaSlidersHSolid className='size-5 ' />
					</button>
					<Button className='w-32 flex gap-2'>
						<FiFolderPlus />
						<span>Add Meter</span>
					</Button>
				</div>
			</SectionHeader>
			<div className=''>
				<BillableMetricTable data={dummyData} />
			</div>
		</div>
	);
};

export default BillableMetricsPage;
