import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button, Input, RadioGroup, Select } from '@/components/atoms';
import { EventFilter, EventFilterData } from '@/components/molecules';
import { LuCircleFadingPlus, LuRefreshCw } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/App';
import { Meter } from '@/models/Meter';

interface MeterFormProps {
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

const MeterForm: React.FC<MeterFormProps> = ({ data, onSubmit }) => {
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

	useEffect(() => {
		console.log('evnt filters in meter form', eventFilters);
		console.log('data in meter form length', eventFilters.length);
	}, [eventFilters]);

	const radioMenuItemList = [
		{
			label: 'Cumulative',
			description: 'Email digest, mentions & all activity.',
			value: 'never',
			icon: LuCircleFadingPlus,
		},
		{
			label: 'Period',
			description: 'Only mentions and comments.',
			value: 'RESET_PERIOD',
			icon: LuRefreshCw,
		},
	];

	// const resetForm = () => {
	// 	setDisplayName('');
	// 	setEventName('');
	// 	setEventFilters([]);
	// 	setAggregationFunction('SUM');
	// 	setAggregationValue('');
	// 	setResetPeriod('');
	// };

	// Handle form submission
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

			onSubmit(formData as Meter, isEditMode ? 'edit' : 'add');

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
			console.log('Errors:', fieldErrors);

			setErrors(fieldErrors);
		}
	};

	return (
		<div className='h-screen w-full'>
			{/* heading */}

			{/* add meter heading */}
			{!isEditMode && (
				<div className='p-6'>
					<p className='font-bold text-zinc text-[20px]'>Add Meter</p>
					<p className={labelStyle}>Make changes to your account here. Click save when you're done.</p>
				</div>
			)}

			<div className='px-6 py-4 max-w-3xl flex flex-col gap-7'>
				{/* edit meter heading */}
				{isEditMode && <p className='font-bold text-zinc-950 text-[20px]'>{data?.name}</p>}

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
							selectedValue={aggregationFunction}
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
		</div>
	);
};

export default MeterForm;
