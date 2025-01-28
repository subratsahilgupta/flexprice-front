import { SectionHeader } from '@/components/atoms';
import SelectMeter from '@/components/organisms/PlanForm/SelectMeter';
import { Skeleton } from '@/components/ui/skeleton';
import EventsApi from '@/utils/api_requests/EventsApi';
import { formatDateShort } from '@/utils/common/helper_functions';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const QueryPage = () => {
	const [payload, setPayload] = useState<{
		meter_id?: string;
		customer_id?: string;
		end_time?: string;
		start_time?: string;
		external_customer_id?: string;
		window_size?: string;
	}>();

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
				window_size: 'DAY',
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
		<div className=''>
			<SectionHeader title='Query' />

			<Card className='mb-6'>
				<CardHeader>
					<CardTitle>Usage Statistics</CardTitle>
					<CardDescription>Analyze meter data over time</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='w-full flex items-end gap-4 mb-6'>
						<SelectMeter
							onChange={(value) => {
								setPayload({ ...payload, meter_id: value.id });
							}}
						/>
					</div>
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
