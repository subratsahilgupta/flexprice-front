import { Button, Loader, SectionHeader, Spacer } from '@/components/atoms';
import { FeatureTable, Pagination } from '@/components/molecules';
import { RouteNames } from '@/core/routes/Routes';
import usePagination from '@/hooks/usePagination';
import FeatureApi from '@/utils/api_requests/FeatureApi';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { IoSearch } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

const FeaturesPage = () => {
	const { limit, offset, page } = usePagination();

	const fetchMeters = async () => {
		return await FeatureApi.getAllFeatures({
			limit,
			offset,
		});
	};

	const {
		data: featureData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchFeatures', page],
		queryFn: fetchMeters,
		retry: 2,
		staleTime: 0,
	});

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching features');
	}
	if (featureData?.items.length === 0) {
		return (
			<div className='h-screen w-full flex justify-center items-center'>
				<div className='w-full flex flex-col items-center '>
					<ReactSVG src={'/assets/svg/empty box.svg'} />
					<p className='font-sans text-2xl font-bold'>Add your first Feature</p>
					<p className='text-[#71717A] font-normal '>
						{'A billable base metric is used to measure usage, and act as a foundation of pricing (e.g., API calls for an API product).'}
					</p>
					<Spacer height={'16px'} />
					<Link to={RouteNames.createFeature}>
						<Button className='w-32 flex gap-2 bg-[#0F172A] '>
							<Star />
							<span>Add Feature</span>
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='page'>
			<SectionHeader showFilter showSearch className='' title='Features'>
				<div className='flex gap-2 w-full'>
					<Link to={RouteNames.createFeature}>
						<Button className='w-32 flex gap-2 bg-[#0F172A]  '>
							<Star />
							<span>Add Feature</span>
						</Button>
					</Link>
				</div>
			</SectionHeader>
			<div className=''>
				<FeatureTable data={featureData?.items || []} />
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((featureData?.pagination.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default FeaturesPage;
