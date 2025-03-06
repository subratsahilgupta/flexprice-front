import { AddButton, Loader, Page, ShortPagination, Spacer } from '@/components/atoms';
import { FeatureTable } from '@/components/molecules';
import EmptyPage from '@/components/organisms/EmptyPage/EmptyPage';
import { RouteNames } from '@/core/routes/Routes';
import usePagination from '@/hooks/usePagination';
import FeatureApi from '@/utils/api_requests/FeatureApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
	const { limit, offset, page } = usePagination();

	const fetchFeatures = async () => {
		return await FeatureApi.getAllFeatures({
			limit,
			offset,
		});
	};
	const navigate = useNavigate();

	const {
		data: featureData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchFeatures', page],
		queryFn: fetchFeatures,
	});

	console.log(featureData, isLoading);

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching features');
	}
	if (featureData?.items.length === 0) {
		return (
			<EmptyPage
				title='No features found'
				description='Create a feature to get started'
				onAddClick={() => navigate(RouteNames.createFeature)}
			/>
		);
	}

	return (
		<Page
			heading='Features'
			headingCTA={
				<Link to={RouteNames.createFeature}>
					<AddButton />
				</Link>
			}>
			<div>
				<FeatureTable data={featureData?.items || []} />
				<Spacer className='!h-4' />
				<ShortPagination unit='Features' totalItems={featureData?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default FeaturesPage;
