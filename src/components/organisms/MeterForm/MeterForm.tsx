import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button, Input, RadioGroup, Select, Spacer } from '@/components/atoms';
import { EventFilter, EventFilterData } from '@/components/molecules';
import { LuCircleFadingPlus, LuRefreshCw } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/App';
import { Meter } from '@/models/Meter';
import { v4 as uuidv4 } from 'uuid';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
	data?: Meter;
	onSubmit: (data: Meter, mode: 'add' | 'edit') => void;
}

// Zod Schema for Validation
const MeterFormSchema = z.object({
	eventName: z.string().min(1, { message: 'Event Name is required' }),
	displayName: z.string().min(1, { message: 'Display Name is required' }),
	eventFilters: z
		.array(z.any())
		// z.object({
		// 	key: z.string().min(1, { message: 'Filter key is required' }).optional(),
		// 	value: z.array(z.string().min(1, { message: 'Filter value is required' })).optional(),
		// }),
		.optional(),
	aggregationFunction: z.enum(['SUM', 'COUNT'], { errorMap: () => ({ message: 'Invalid aggregation function' }) }),
	aggregationValue: z.string().min(1, { message: 'Aggregation Value is required' }),
	resetPeriod: z.string().optional(),
});

const MeterForm: React.FC<Props> = ({ data, onSubmit }) => {
	const labelStyle = 'text-muted-foreground text-sm';

	const isEditMode = Boolean(data);
	const isArchived = data?.status === 'archived';

	const [eventName, setEventName] = useState(data?.event_name || '');
	const [displayName, setDisplayName] = useState(data?.name || '');
	const [eventFilters, setEventFilters] = useState<{ key: string; values: string[] }[]>([]);
	const [aggregationFunction, setAggregationFunction] = useState(data?.aggregation.type || 'SUM');
	const [aggregationValue, setAggregationValue] = useState(data?.aggregation.field || '');
	const [resetPeriod, setResetPeriod] = useState(data?.reset_usage || '');
	const navigate = useNavigate();

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => { }, [eventFilters]);
	const getRandomDate = () => {
		const start = new Date(2020, 0, 1);
		const end = new Date();
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
	};

	const curlCommand = `curl --request POST \\
		--url https://api.cloud.flexprice.io/v1/events \\
		--header 'Content-Type: application/json' \\
		--header 'x-api-key: <your_api_key>' \\
		--data '{
		  "event_id": "${'event_' + uuidv4().replace(/-/g, '').slice(0, 10)}",
		  "event_name": "${data?.event_name ?? (eventName || '__MUST_BE_DEFINED__')}",
		  "external_customer_id": "__CUSTOMER_ID__",
		  "properties": {${eventFilters.map((filter) => `\n\t\t\t "${filter.key}" : "${filter.values[0] || 'FILTER_VALUE'}"`).join(',')}${aggregationValue ? `,\n\t\t\t "${aggregationValue}":"__${aggregationValue.split(' ').join('_').toUpperCase()}__"` : ''}
		  },
		  "source": "api",
		"timestamp": "${getRandomDate()}"
		}'`;

	const radioMenuItemList = [
		{
			label: 'Cumulative',
			description: 'Track values continuously without resetting, useful for metrics like lifetime usage.',
			value: 'never',
			icon: LuCircleFadingPlus,
		},
		{
			label: 'Periodic',
			description: 'Reset values based on the billing cycle, such as monthly or annual usage',
			value: 'RESET_PERIOD',
			icon: LuRefreshCw,
		},
	];

	const handleSubmit = () => {
		// Form data object
		const formData = {
			eventName,
			displayName,
			eventFilters,
			aggregationFunction,
			aggregationValue,
			resetPeriod,
		};

		// Validate using Zod schema
		const validation = MeterFormSchema.safeParse(formData);

		if (validation.success) {
			const formData = {
				event_name: eventName,
				name: displayName,
				aggregation: {
					type: aggregationFunction,
					field: aggregationValue,
				},
				filters: eventFilters
					.filter((filter) => filter.key && filter.values.length > 0)
					.map((filter) => ({
						key: filter.key,
						values: filter.values,
					})),
				reset_usage: resetPeriod,
			};
			onSubmit(formData as unknown as Meter, isEditMode ? 'edit' : 'add');

			queryClient.invalidateQueries({
				queryKey: ['fetchMeters'],
			});
			navigate('/usage-tracking/billable-metric');

			setErrors({});
		} else {
			// If invalid, set errors
			const fieldErrors: Record<string, string> = {};
			validation.error.errors.forEach((err: Record<string, any>) => {
				if (err.path[0]) {
					fieldErrors[err.path[0] as string] = err.message;
				}
			});

			setErrors(fieldErrors);
		}
	};

	return (
		<div className='h-screen w-full '>
			{/* heading */}
			{!isEditMode && (
				<div className='p-6'>
					<p className='font-bold text-zinc text-[20px]'>Add Meter</p>
					<p className={labelStyle}>Make changes to your account here. Click save when you're done.</p>
				</div>
			)}

			{isEditMode && <p className='font-bold text-zinc-950 text-[20px] p-6'>{data?.name}</p>}

			<div className='w-full flex gap-0 relative   !mb-24'>
				{/* meter form */}

				{/* add meter heading */}

				<div className='px-6 pb-6 flex-[8] flex flex-col gap-7  '>
					{/* Event Schema */}
					<div className='p-6 rounded-xl border border-[#E4E4E7]'>
						<div className='mb-4'>
							<p className='font-inter font-semibold text-base'>Event Schema</p>
							<p className={labelStyle}>Assign a name to your event schema to easily identify and track events processed.</p>
						</div>

						<div className='flex flex-col gap-4'>
							<Input
								value={eventName}
								onChange={setEventName}
								disabled={isEditMode}
								placeholder='tokens_total'
								label='Event Name'
								description='A unique identifier for the meter. This is used to refer to the meter in the Flexprice APIs.'
								error={errors.eventName}
							/>
							<Input
								value={displayName}
								disabled={isEditMode}
								onChange={setDisplayName}
								label='Display Name'
								placeholder='Total Token'
								description='This name will be used in the invoices.'
								error={errors.displayName}
							/>
						</div>
					</div>

					{/* Event Filters */}
					<div className='p-6 rounded-xl border border-[#E4E4E7]'>
						<div className='mb-4'>
							<p className='font-inter font-semibold text-base'>Event Filters</p>
							<p className={labelStyle}>
								Name of the property key in the data object. The groups should only include low cardinality fields.
							</p>
						</div>

						<div className=''>
							<EventFilter
								isArchived={isArchived}
								isEditMode={isEditMode}
								eventFilters={eventFilters}
								setEventFilters={setEventFilters}
								error={errors.eventFilters}
								permanentFilters={data?.filters as EventFilterData[] | undefined}
							/>
						</div>
					</div>

					{/* Aggregation */}
					<div className='p-6 rounded-xl space-y-2 border border-[#E4E4E7]'>
						<div className='mb-4'>
							<p className='font-inter font-semibold text-base'>Define Aggregation</p>
							<p className={labelStyle}>Assign a name to your event schema to easily identify and track events processed.</p>
						</div>

						<div className='flex flex-col gap-4'>
							<Select
								disabled={isEditMode}
								options={[
									{ label: 'SUM', value: 'SUM' },
									{ label: 'COUNT', value: 'COUNT' },
								]}
								value={aggregationFunction}
								onChange={setAggregationFunction}
								description='The aggregation function to apply to the event values.'
								label='Aggregation'
								placeholder='SUM'
								error={errors.aggregationFunction}
							/>

							<Input
								value={aggregationValue}
								disabled={isEditMode}
								onChange={(e) => setAggregationValue(e)}
								label='Aggregation Value'
								placeholder='tokens'
								description='Name of the property in the data object holding the value to aggregate over.'
								error={errors.aggregationValue}
							/>
						</div>

						<div className='!mt-6'>
							<RadioGroup
								disabled={isEditMode}
								items={radioMenuItemList}
								selected={radioMenuItemList.find((item) => item.value === resetPeriod)}
								title='Aggregation Type'
								onChange={(value) => setResetPeriod(value.value!)}
							/>
						</div>
					</div>

					{/* Submit Button */}
					<div className={cn('flex justify-start', isEditMode && 'hidden')}>
						<Button onClick={handleSubmit} className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark'>
							{'Save Meter'}
						</Button>
					</div>
					{isEditMode && (
						<div className={cn('flex justify-start')}>
							<Button
								disabled={eventFilters.length <= 0}
								onClick={handleSubmit}
								className='bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-primary-dark'>
								{'Save Changes'}
							</Button>
						</div>
					)}
				</div>

				{/* preview */}
				<div className={cn('flex-[3] max-w-lg  relative')}>
					<div className={cn('sticky border-zinc-300 border top-24 float-right bg-[#0000000D] p-6 rounded-lg')}>
						<div className='flex   justify-between items-center w-full'>
							<p className=' font-semibold text-lg'>Test This Snippet</p>
							<Button
								onClick={() => {
									navigator.clipboard.writeText(curlCommand);
									toast.success('Copied to clipboard');
								}}
								className='text-muted-foreground cursor-pointer absolute top-4 right-4 size-8'
								variant={'ghost'}>
								<Copy className='' />
							</Button>
						</div>
						<Spacer className='!h-6' />
						<pre className='text-xs font-fira-code '>
							{/* <CodePreview className='' code={curlCommand} language='javascript' /> */}
							{curlCommand}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MeterForm;
