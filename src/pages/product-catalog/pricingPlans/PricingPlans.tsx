import { Button, Page, SectionHeader, Spacer } from '@/components/atoms';
import { IoSearch } from 'react-icons/io5';
import { FiFolderPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/atoms';
import toast from 'react-hot-toast';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { Pagination, PlansTable } from '@/components/molecules';
import { Plan } from '@/models/Plan';
import { ReactSVG } from 'react-svg';
import usePagination from '@/hooks/usePagination';
import { SlidersHorizontal } from 'lucide-react';

const PricingPlan = () => {
	const { limit, offset, page } = usePagination();

	const fetchPlans = async () => {
		return await PlanApi.getAllPlans({
			limit,
			offset,
		});
	};

	const {
		data: plansData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchPlans', page],
		queryFn: fetchPlans,

		// staleTime: 1000 * 60 * 5,
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

	if ((plansData?.items ?? []).length === 0) {
		return (
			<div className='h-screen w-full flex justify-center items-center'>
				<div className='w-full flex flex-col items-center '>
					<ReactSVG src={'/assets/svg/empty box.svg'} />
					<p className='font-sans text-2xl font-bold'>Add your first Plan </p>
					<p className='text-[#71717A] font-normal '>Add your first Pricing Plan</p>
					<Spacer height={'16px'} />
					<Link to='/product-catalog/pricing-plan/create-plan'>
						<Button className='w-32 flex gap-2 bg-[#0F172A] '>
							<FiFolderPlus />
							<span>Create Plan</span>
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<Page className=''>
			<SectionHeader title='Pricing Plan'>
				<div className='flex gap-2 w-full'>
					<button className='px-2 py-1'>
						<IoSearch className='size-4 text-[#09090B] ' />
					</button>
					<button className='px-2 py-1'>
						<SlidersHorizontal className='size-4 text-[#09090B] ' />
					</button>
					<Link to='/product-catalog/pricing-plan/create-plan'>
						<Button className=' flex gap-2 bg-[#0F172A] '>
							<FiFolderPlus />
							<span>Add Pricing Plan</span>
						</Button>
					</Link>
				</div>
			</SectionHeader>
			<div className=''>
				<PlansTable data={(plansData?.items || []) as Plan[]} />
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((plansData?.pagination.total ?? 1) / limit)} />
			</div>
		</Page>
	);
};

export default PricingPlan;
