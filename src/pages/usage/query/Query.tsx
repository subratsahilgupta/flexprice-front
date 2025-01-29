import { FormHeader, Input } from '@/components/atoms';
import SelectMeter from '@/components/organisms/PlanForm/SelectMeter';
import { Skeleton } from '@/components/ui/skeleton';
import EventsApi from '@/utils/api_requests/EventsApi';
import { formatDateShort } from '@/utils/common/helper_functions';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const QueryPage = () => {
	const windowSizeOptions = [
		{ label: 'Min', value: 'MIN' },
		{ label: 'Hour', value: 'HOUR' },
		{ label: 'Day', value: 'DAY' },
	];

	const [payload, setPayload] = useState<{
		meter_id?: string;
		customer_id?: string;
		end_time?: string;
		start_time?: string;
		external_customer_id?: string;
		window_size?: string;
	}>({
		window_size: windowSizeOptions[0].value,
	});

	const {
		data,
		mutate: fetchUsage,
		isPending,
	} = useMutation({
		mutationKey: [
			'fetchMeters1',
			payload?.customer_id,
			payload?.end_time,
			payload?.start_time,
			payload?.external_customer_id,
			payload?.window_size,
		],
		mutationFn: async () => {
			return await EventsApi.getUsageByMeter({
				meter_id: 'c37aee66-6b25-4a08-8076-891f37e2df26',
				// meter_id:payload?.meter_id|| "c37aee66-6b25-4a08-8076-891f37e2df26",
				customer_id: payload?.customer_id,
				end_time: payload?.end_time,
				start_time: payload?.start_time,
				external_customer_id: payload?.external_customer_id,
				window_size: payload?.window_size,
				// window_size: 'DAY',
			});
		},
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			toast.error('Error fetching data');
			console.log(error);
		},
	});

	useEffect(() => {
		if (payload?.meter_id) {
			fetchUsage();
		}
	}, [payload]);

	const formattedData = data?.results?.map((item) => ({
		date: formatDateShort(item.window_size),
		value: item.value,
	}));

	const chartConfig = {
		value: {
			label: 'Usage',
			color: 'hsl(var(--chart-1))',
		},
	} satisfies ChartConfig;

	return (
		<div className='p-4'>
			<FormHeader
				className=''
				variant='form-title'
				title='Query'
				subtitle="Make changes to your account here. Click save when you're done."
			/>

			{/* filters */}
			<div className='w-full flex items-end gap-6 mb-6 mt-6'>
				<SelectMeter
					placeholder='Select Billable Metric'
					onChange={(value) => {
						setPayload({ ...payload, meter_id: value.id });
					}}
				/>
				<div className='max-w-36'>
					<Input className='!h-9' label='Customer ID' onChange={(e) => setPayload({ ...payload, customer_id: e })} />
				</div>
				<div className=''>
					<label className={cn('font-inter block text-sm font-medium')}>{'Window Size'}</label>
					<div className='flex gap-1'>
						{windowSizeOptions.map((option) => {
							const isActive = payload?.window_size === option.value;
							return (
								<button
									onClick={() => {
										setPayload({ ...payload, window_size: option.value });
									}}
									key={option.value}
									className={cn(
										'flex items-center gap-2 cursor-pointer text-sm font-normal border-2 rounded-sm border-gray-300 py-2 px-3 h-9 ',
										isActive ? 'bg-gray-100' : 'text-gray-500',
									)}>
									{option.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<Card className='mb-6'>
				<CardContent>
					{isPending ? (
						<Skeleton className='h-48 mb-4' />
					) : (
						<ChartContainer config={chartConfig}>
							<ResponsiveContainer className={'w-full h-[300px]'} width='100%' height={300}>
								<LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='date' tickLine={false} axisLine={false} tickMargin={8} />
									<YAxis />
									<RechartsTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
									<Line type='monotone' dataKey='value' stroke='var(--color-value)' strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
								</LineChart>
							</ResponsiveContainer>
						</ChartContainer>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default QueryPage;
