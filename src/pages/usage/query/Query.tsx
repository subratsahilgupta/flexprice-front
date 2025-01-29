import { DateRangePicker, FormHeader, Input } from '@/components/atoms';
import SelectMeter from '@/components/organisms/PlanForm/SelectMeter';
import { Skeleton } from '@/components/ui/skeleton';
import EventsApi from '@/utils/api_requests/EventsApi';
import { formatDateShort } from '@/utils/common/helper_functions';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const QueryPage = () => {
	const windowSizeOptions = [
		{ label: 'Min', value: 'MINUTE' },
		{ label: 'Hour', value: 'HOUR' },
		{ label: 'Day', value: 'DAY' },
	];

	const [payload, setPayload] = useState<{
		meter_id?: string;
		customer_id?: string;
		end_time?: Date;
		start_time?: Date;
		external_customer_id?: string;
		window_size?: string;
	}>({
		window_size: windowSizeOptions[1].value,
	});

	const {
		data,
		mutate: fetchUsage,
		isPending,
	} = useMutation({
		mutationKey: [
			'fetchMeters1',
			payload.customer_id,
			payload.end_time,
			payload.start_time,
			payload.external_customer_id,
			payload.window_size,
		],
		mutationFn: async () => {
			return await EventsApi.getUsageByMeter({
				meter_id: 'c37aee66-6b25-4a08-8076-891f37e2df26',
				customer_id: payload.customer_id,
				end_time: payload.end_time?.toISOString(),
				start_time: payload.start_time?.toISOString(),
				external_customer_id: payload.external_customer_id,
				window_size: payload.window_size,
			});
		},
		onSuccess: (data) => console.log(data),
		onError: () => toast.error('Error fetching data'),
	});

	useEffect(() => {
		if (payload?.meter_id) {
			fetchUsage();
		}
	}, [payload]);

	const formattedData = data?.results?.length
		? data.results.map((item) => ({
				date: formatDateShort(item.window_size),
				value: item.value,
			}))
		: [
				{ date: formatDateShort(new Date().toISOString()), value: 0 },
				{ date: formatDateShort(new Date().toISOString()), value: 0 },
			];

	const chartConfig = {
		value: { label: 'Usage', color: 'hsl(var(--chart-1))' },
	} satisfies ChartConfig;

	return (
		<div className='p-6 space-y-6'>
			<FormHeader variant='form-title' title='Query' subtitle='Analyze meter usage and adjust filters to refine your results.' />

			{/* Filters Section */}
			<div className='flex w-full  gap-4 items-end bg-white '>
				{/* Meter Selection */}
				<SelectMeter placeholder='Select Billable Metric' onChange={(value) => setPayload({ ...payload, meter_id: value.id })} />

				{/* Customer ID Input */}
				<Input
					value={payload.customer_id}
					suffix={<Search className='size-4' />}
					className='!h-10'
					label='Customer ID'
					placeholder='Search by Customer ID'
					onChange={(e) => setPayload({ ...payload, customer_id: e })}
				/>

				{/* Window Size Selector */}
				<div>
					<label className='block text-sm font-medium'>Window Size</label>
					<div className='flex gap-1'>
						{windowSizeOptions.map((option) => {
							const isActive = payload?.window_size === option.value;
							return (
								<button
									key={option.value}
									onClick={() => setPayload({ ...payload, window_size: option.value })}
									className={cn(
										'text-sm px-3 py-2 rounded-md border',
										isActive ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' : '',
									)}>
									{option.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Date Range Picker */}
				<DateRangePicker
					title='Time Period'
					onChange={({ endDate, startDate }) => setPayload({ ...payload, start_time: startDate, end_time: endDate })}
					startDate={payload.start_time!}
					endDate={payload.end_time!}
				/>
			</div>

			{/* Chart Section */}
			<Card className='shadow-md'>
				<CardContent className='mt-6'>
					{isPending ? (
						<Skeleton className='h-48 mb-4' />
					) : (
						<ChartContainer className='!max-h-96 w-full' config={chartConfig}>
							<LineChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
								<CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
								<XAxis dataKey='date' tickLine={false} axisLine={false} tickMargin={10} className='text-gray-500' />
								<YAxis tickLine={false} className='text-gray-500' />
								<RechartsTooltip content={<ChartTooltipContent hideLabel />} cursor={{ stroke: '#ccc' }} />
								<Line
									type='monotone'
									dataKey='value'
									stroke='#18181B'
									strokeWidth={1}
									dot={{ r: 2, fill: '#18181B' }}
									activeDot={{ r: 3, strokeWidth: 1 }}
								/>
							</LineChart>
						</ChartContainer>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default QueryPage;
