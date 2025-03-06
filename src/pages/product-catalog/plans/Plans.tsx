import { AddButton, Loader, Page, ShortPagination, Spacer } from '@/components/atoms';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import toast from 'react-hot-toast';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { PlansTable } from '@/components/molecules';
import { Plan } from '@/models/Plan';
import { ReactSVG } from 'react-svg';
import usePagination from '@/hooks/usePagination';
import { RouteNames } from '@/core/routes/Routes';

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
		return <Loader />;
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
					<Link to={RouteNames.createPlan}>
						<AddButton />
					</Link>
				</div>
			</div>
		);
	}

	return (
		<Page
			heading='Plans'
			headingCTA={
				<Link to={RouteNames.createPlan}>
					<AddButton />
				</Link>
			}>
			<div>
				<PlansTable data={(plansData?.items || []) as Plan[]} />
				<Spacer className='!h-4' />
				<ShortPagination unit='Pricing Plans' totalItems={plansData?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default PricingPlan;
