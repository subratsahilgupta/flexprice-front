import { Input, RadioGroup, RadioMenuItem } from '@/components/atoms';
import { EventFilter, EventFilterData } from '@/components/molecules';
import { useState } from 'react';
import { LuCircleFadingPlus } from 'react-icons/lu';
import { LuRefreshCw } from 'react-icons/lu';
const AddMeterPage = () => {
	const labelStyle = 'text-muted-foreground text-sm';

	const [events, setevents] = useState<EventFilterData[]>([]);

	const RadioMenuItemList: RadioMenuItem[] = [
		{
			label: 'Cumulative',
			desciption: 'Email digest, mentions & all activity.',
			value: 'cumulative',
			icon: LuCircleFadingPlus,
		},
		{
			label: 'Period',
			desciption: 'Only mentions and comments.',
			value: 'period',
			icon: LuRefreshCw,
		},
	];

	const [aggregation, setaggregation] = useState<RadioMenuItem>(RadioMenuItemList[0]);

	return (
		<div className='h-screen w-full'>
			{/* heading */}
			<div className='p-6'>
				<p className='font-bold text-zinc text-[20px]'>Add Meter</p>
				<p className={labelStyle}>Make changes to your account here. Click save when you're done.</p>
			</div>

			<div className='px-6 py-4 max-w-3xl flex flex-col gap-7'>
				<div className='p-6 rounded-xl border border-[#E4E4E7]'>
					<div className='mb-4'>
						<p className='font-inter font-semibold text-base'>Event Schema</p>
						<p className={labelStyle}>Assign a name to your event schema to easily identify and track events processed.</p>
					</div>

					<div className='flex flex-col gap-4'>
						<Input
							placeholder={'tokens_total'}
							label={'Event Name'}
							description={'A unique identifier for the meter. This is used to refer the meter in the Flexprice APIs.'}
						/>
						<Input label={'Display Name'} placeholder={'Total Token'} description={'This name will be used in the invoices. '} />
						{/* <Input placeholder={''} label={''} description={''} /> */}
					</div>
				</div>

				<div className='p-6 rounded-xl border border-[#E4E4E7]'>
					<div className='mb-6'>
						<p className='font-inter font-semibold text-base'>Event Filters</p>
						<p className={labelStyle}>
							Name of the property key in the data object. The groups should only include low cardinality fields.
						</p>
					</div>

					<div className=''>
						<EventFilter eventFilters={events} setEventFilters={setevents} />
					</div>
				</div>

				<div className='p-6 rounded-xl space-y-2 border border-[#E4E4E7]'>
					<div className='mb-4'>
						<p className='font-inter font-semibold text-base'>Define Aggregation</p>
						<p className={labelStyle}>Assign a name to your event schema to easily identify and track events processed.</p>
					</div>

					<div className='flex flex-col gap-4'>
						<Input placeholder={'SUM'} label={'Aggregation'} description={'The aggregation function to apply to the event values.'} />
						<Input
							label={'Aggregation  Value'}
							placeholder={'tokens'}
							description={'Name of the property in data object holding the value to aggregate over. '}
						/>
					</div>

					<div className='mt-4'>
						<RadioGroup
							items={RadioMenuItemList}
							selected={aggregation}
							title='Aggregation Type'
							onChange={(value) => setaggregation(value)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddMeterPage;
