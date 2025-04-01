import { AddButton, Loader, Page, ShortPagination, Spacer } from '@/components/atoms';
import { ApiDocsContent, FeatureTable } from '@/components/molecules';
import EmptyPage from '@/components/organisms/EmptyPage/EmptyPage';
import { RouteNames } from '@/core/routes/Routes';
import GUIDES from '@/core/constants/guides';
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

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching features');
	}
	if (featureData?.items.length === 0) {
		return (
			<EmptyPage
				heading='Feature'
				onAddClick={() => navigate(RouteNames.createFeature)}
				tags={['Features']}
				tutorials={GUIDES.features.tutorials}
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
			<ApiDocsContent tags={['Features']} />
			<div>
				<FeatureTable data={featureData?.items || []} />
				<Spacer className='!h-4' />
				<ShortPagination unit='Features' totalItems={featureData?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default FeaturesPage;
