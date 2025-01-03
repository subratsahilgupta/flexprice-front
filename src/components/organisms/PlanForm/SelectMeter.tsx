import { Option, Select } from '@/components/atoms';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

const fetchMeters = async () => {
	return await MeterApi.getAllMeters();
};

interface Props {
	onChange: (value: string) => void;
	value?: string;
}

const SelectMeter: FC<Props> = ({ onChange, value }) => {
	const {
		data: meters,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchMeters1'],
		queryFn: fetchMeters,
		retry: 2,
		staleTime: 0,
	});

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Error</div>;
	}

	if (!meters) {
		return <div>No meters found</div>;
	}

	const activeMeters: Option[] = meters!
		.filter((meter) => meter.status === 'published')
		.map((meter) => {
			return {
				label: meter.name,
				value: meter.id,
			};
		});

	return (
		<div>
			<Select selectedValue={value} onChange={(e) => onChange(e)} options={activeMeters} placeholder='Select Meter' label='Select Meter' />
		</div>
	);
};

export default SelectMeter;
