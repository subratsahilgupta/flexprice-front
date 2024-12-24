import { Button, SectionHeader } from '@/components/atoms';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';
import { FiFolderPlus } from 'react-icons/fi';
import { BillableMetricTable } from '@/components/molecules';
import { BillableMetric } from '@/components/molecules/BillableMetricTable';

const BillableMetricsPage = () => {
	const dummyData: BillableMetric[] = [
		{
			eventName: 'Requests per minute',
			aggregateType: 'Sum',
			aggregateValue: 'tokens',
			status: 'Active',
			updatedAt: new Date(),
			_id: '1',
		},
		{
			eventName: 'Requests per minute',
			aggregateType: 'Average',
			aggregateValue: 'tokens',
			status: 'Inactive',
			updatedAt: new Date(),
			_id: '2',
		},
		{
			eventName: 'Requests per minute',
			aggregateType: 'Count',
			aggregateValue: 'tokens',
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
						<IoSearch className='size-5 text-[#09090B] ' />
					</button>
					<button className='px-2 py-1'>
						<LiaSlidersHSolid className='size-5 text-[#09090B] ' />
					</button>
					<Button className='w-32 flex gap-2 bg-[#0F172A] '>
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
