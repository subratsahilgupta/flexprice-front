import { queryClient } from '@/App';
import { MeterForm } from '@/components/organisms';
import { Meter } from '@/models/Meter';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AddMeterPage = () => {
	const { mutate: createMeter } = useMutation({
		mutationKey: ['addMeter'],
		mutationFn: async (data: Partial<Meter>) => {
			const res = await MeterApi.createMeter(data);
			return res;
		},
		retry: 1,
		onSuccess: async () => {
			toast.success('Meter created successfully');
			await queryClient.refetchQueries({ queryKey: ['fetchMeters'] });
			queryClient.invalidateQueries({ queryKey: ['fetchMeters'] });
		},
		onError: () => {
			toast.error('Error creating meter');
		},
	});

	const handleCreateMeter = (data: Meter) => {
		createMeter(data);
	};

	return (
		<div className='h-screen w-full'>
			<MeterForm onSubmit={(data) => handleCreateMeter(data)} />
		</div>
	);
};

export default AddMeterPage;
