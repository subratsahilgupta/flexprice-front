import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import { IoRepeat } from 'react-icons/io5';
import { FaDatabase } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

const SetupChargesSection = () => {
	const currencyOptions = [
		{ label: 'USD', value: 'USD' },
		{ label: 'INR', value: 'INR' },
	];
	const subscriptionTypes = [
		{
			value: 'recurring',
			label: 'Recurring',
			icon: IoRepeat,
		},
		{
			value: 'usage_based',
			label: 'Usage Based',
			icon: FaDatabase,
		},
	];

	const [subscriptionType, setsubscriptionType] = useState<string>();
	const [currency, setcurrency] = useState(currencyOptions[0].value);

	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Plan Charges '}
				subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
				variant='sub-header'
			/>
			<FormHeader title={'Select the Subscription Type'} variant='form-component-title' />
			<div className='w-full gap-4 grid grid-cols-2'>
				{subscriptionTypes.map((type) => {
					const isActive = subscriptionType === type.value;
					return (
						<button
							onClick={() => setsubscriptionType(type.value)}
							className={cn(
								'p-3 rounded-md border-2  w-full flex flex-col justify-center items-center',
								isActive ? 'border-[#0F172A]' : 'border-[#E2E8F0]',
							)}>
							{type.icon && <type.icon size={24} className='text-[#020617]' />}
							<p className='text-[#18181B] font-medium mt-2'>{type.label}</p>
						</button>
					);
				})}
			</div>
			<Spacer height={'4px'} />
			<p className=' text-sm text-muted-foreground'>Default subscription means... Subscription means lorem ipsum</p>

			<Spacer height={'16px'} />
			{/* Recurring price ui */}
			{subscriptionType === 'recurring' && (
				<div className=''>
					<FormHeader title='Recurring Fee' variant='form-component-title' />
					<Select selectedValue={currency} options={currencyOptions} label='Select Currency' placeholder='Select Currency' />
					<Spacer height={'8px'} />
					<Select
						selectedValue='monthly'
						options={[
							{ label: 'Monthly', value: 'monthly' },
							{ label: 'Yearly', value: 'yearly' },
						]}
						onChange={(value) => {
							console.log('new value in setup', value);

							setcurrency(value);
						}}
						label='Billing Period'
						placeholder='Select The Billing Period'
					/>
					<Spacer height={'8px'} />
					<Input label='Value' prefix={currency} suffix={<span className='text-[#64748B]'>per month</span>} />
					<Spacer height={'16px'} />
					<div className='flex justify-end'>
						<Button variant='secondary' className='mr-4 text-zinc-900 '>
							Cancel
						</Button>
						<Button variant='default' className='mr-4'>
							Add
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SetupChargesSection;
