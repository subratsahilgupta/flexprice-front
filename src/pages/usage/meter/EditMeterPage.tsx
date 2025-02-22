import { Spinner } from '@/components/atoms';
import { MeterForm } from '@/components/organisms';
import { Meter } from '@/models/Meter';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';

const fetchMeterData = async (id: string) => {
	return await MeterApi.getMeterById(id);
};

const updateMeter = async (id: string, data: Partial<Meter>) => {
	return await MeterApi.updateMeter(id, data);
};

const EditMeterPage = () => {
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
		queryKey: ['fetchMeterData', id],
		queryFn: () => fetchMeterData(id!),
		enabled: !!id,
	});

	const { mutate: updateMeterData, isPending } = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Meter> }) =>
			updateMeter(id, {
				...data,
				id: id,
			}),
		onSuccess: async () => {
			toast.success('Meter updated successfully');
			navigate(RouteNames.meter);
		},
		onError() {
			toast.error('Error updating meter');
		},
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
			<MeterForm
				data={meter}
				onSubmit={(data) => {
					updateMeterData({ id: id!, data: { filters: data.filters } });
				}}
				isLoading={isPending}
			/>
		</div>
	);
};

export default EditMeterPage;
