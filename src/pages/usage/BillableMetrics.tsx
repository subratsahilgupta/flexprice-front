import { Button, SectionHeader } from '@/components/atoms';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';
import { FiFolderPlus } from 'react-icons/fi';
import { BillableMetricTable } from '@/components/molecules';
import { Link } from 'react-router-dom';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/atoms';
import toast from 'react-hot-toast';

const fetchMeters = async () => {
	return await MeterApi.getAllMeters();
};

const BillableMetricsPage = () => {
	const {
		data: meters,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchMeters'],
		queryFn: fetchMeters,
		retry: 2,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<div className='fixed inset-0 flex items-center justify-center bg-white/80 z-50'>
				<div className='flex flex-col items-center gap-2'>
					<Spinner size={50} className='text-primary' />
					<p className='text-sm text-gray-500'>Loading...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		toast.error('Error fetching meters');
	}

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
					<Link to='/usage-tracking/billable-metric/add-meter'>
						<Button className='w-32 flex gap-2 bg-[#0F172A] '>
							<FiFolderPlus />
							<span>Add Meter</span>
						</Button>
					</Link>
				</div>
			</SectionHeader>
			<div className=''>
				<BillableMetricTable data={meters || []} />
			</div>
		</div>
	);
};

export default BillableMetricsPage;
