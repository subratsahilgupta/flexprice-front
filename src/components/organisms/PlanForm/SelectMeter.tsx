import { Option, Select } from '@/components/atoms';
import { Meter } from '@/models/Meter';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

const fetchMeters = async () => {
	return await MeterApi.getAllMeters({});
};

interface Props {
	onChange: (value: Meter) => void;
	value?: string;
	error?: string;
}

const SelectMeter: FC<Props> = ({ onChange, value, error }) => {
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
			<Select
				error={error}
				selectedValue={value}
				onChange={(e) => onChange(meters.find((meter) => meter.id === e) as Meter)}
				options={activeMeters}
				placeholder='Select by meter name'
				label='Billable Metric'
			/>
		</div>
	);
};

export default SelectMeter;
