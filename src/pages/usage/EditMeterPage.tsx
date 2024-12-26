import { Spinner } from '@/components/atoms';
import { MeterForm } from '@/components/organisms';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

const fetchMeterData = async (id: string) => {
	return await MeterApi.getMeterById(id);
};

const AddMeterPage = () => {
	const [params] = useSearchParams();
	const navigate = useNavigate();

	const id = params.get('id');

	useEffect(() => {
		if (!id) {
			navigate('/');
		}
	}, [id]);

	const {
		data: meter,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchMeterData'],
		queryFn: () => fetchMeterData(id!),
		retry: 1,
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
		return <Navigate to='/' />;
	}

	return (
		<div className='h-screen w-full'>
			<MeterForm data={meter} onSubmit={() => {}} />
		</div>
	);
};

export default AddMeterPage;
