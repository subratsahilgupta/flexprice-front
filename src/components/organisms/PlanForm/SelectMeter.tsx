import { SelectOption, Select } from '@/components/atoms';
import { Meter } from '@/models/Meter';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

const fetchMeters = async () => {
	return await MeterApi.getAllActiveMeters();
};

interface Props {
	onChange: (value: Meter) => void;
	value?: string;
	error?: string;
	label?: string;
	placeholder?: string;
}

const SelectMeter: FC<Props> = ({ onChange, value, error, label = 'Billable Metric', placeholder = 'Select by meter name' }) => {
	const {
		data: metersData,
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

	if (!metersData) {
		return <div>No meters found</div>;
	}

	const activeMeters: SelectOption[] = metersData!.items
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
				onChange={(e) => onChange(metersData.items.find((meter) => meter.id === e) as Meter)}
				options={activeMeters}
				placeholder={placeholder}
				label={label}
			/>
		</div>
	);
};

export default SelectMeter;
