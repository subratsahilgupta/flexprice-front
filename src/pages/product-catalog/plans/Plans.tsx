import { AddButton, Loader, Page, ShortPagination, Spacer } from '@/components/atoms';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { PlansTable, ApiDocsContent } from '@/components/molecules';
import { Plan } from '@/models/Plan';
import usePagination from '@/hooks/usePagination';
import { RouteNames } from '@/core/routes/Routes';
import { EmptyPage } from '@/components/organisms';

const PricingPlan = () => {
	const { limit, offset, page } = usePagination();

	const fetchPlans = async () => {
		return await PlanApi.getAllPlans({
			limit,
			offset,
		});
	};
	const navigate = useNavigate();

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
			<EmptyPage
				title='No plans found'
				description='Add your first Pricing Plan'
				onAddClick={() => navigate(RouteNames.createPlan)}
				tags={['Plans']}
			/>
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
			<ApiDocsContent tags={['Plans']} />
			<div>
				<PlansTable data={(plansData?.items || []) as Plan[]} />
				<Spacer className='!h-4' />
				<ShortPagination unit='Pricing Plans' totalItems={plansData?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default PricingPlan;
