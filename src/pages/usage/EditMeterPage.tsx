import { MeterForm, MeterFormData } from '@/components/organisms';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AddMeterPage = () => {
	const { mutate: createMeter } = useMutation({
		mutationKey: ['addMeter'],
		mutationFn: async (data: MeterFormData) => {
			const res = await MeterApi.createMeter(data);
			return res;
		},
		retry: 1,
		onSuccess: () => {
			toast.success('Meter created successfully');
		},
		onError: () => {
			toast.error('Error creating meter');
		},
	});

	const handleCreateMeter = (data: MeterFormData) => {
		createMeter(data);
	};

	return (
		<div className='h-screen w-full'>
			<MeterForm onSubmit={(data) => handleCreateMeter(data)} />
		</div>
	);
};

export default AddMeterPage;
