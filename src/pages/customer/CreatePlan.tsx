import { Button, CheckboxRadioGroup, FormHeader, Input, Select, Spacer, Stepper } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { IoRepeat } from 'react-icons/io5';
import { FaDatabase } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

const CreatePlanPage = () => {
	const [activeStep, setactiveStep] = useState(0);
	const [subscriptionType, setsubscriptionType] = useState<string>();
	const formSteps = [{ label: 'Plan Details' }, { label: 'Plan Features' }, { label: 'Plan Pricing' }, { label: 'Plan Preview' }];

	const handleNext = () => {
		if (activeStep === formSteps.length) {
			return;
		}
		setactiveStep((prev) => prev + 1);
	};

	const handleBack = () => {
		if (activeStep === 0) {
			return;
		}
		setactiveStep((prev) => prev - 1);
	};

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

	return (
		<div className='p-6'>
			<FormHeader title={'Plan Details'} subtitle={'Create a new plan by filling in the details below.'} variant='form-title' />

			<Spacer height={'16px'} />

			{/* stepper componenet */}
			<div className='max-w-2xl'>
				<Stepper activeStep={activeStep} steps={formSteps} />

				{/* step 1 */}
				{/* Plan Features */}
				<Spacer height={'16px'} />

				{activeStep === 0 && (
					<div className='p-6 rounded-xl border border-[#E4E4E7]'>
						<FormHeader
							title={'Billing Preferences'}
							subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
							variant='sub-header'
						/>

						{/* checkbox radio group */}
						<CheckboxRadioGroup
							title='Billing timing'
							checkboxItems={[
								{ label: 'Advance', value: 'Advance', description: 'At the end of each billing period' },

								{ label: 'Arrear', value: 'Arrear', description: 'Immediately at the event reception' },
							]}
							onChange={(value) => console.log(value)}
						/>
						<Spacer height={'16px'} />
						<div>
							<FormHeader title='Trial Period' variant='form-component-title' />
							<div className='flex items-center space-x-4 font-open-sans'>
								<Switch id='airplane-mode' />
								<Label htmlFor='airplane-mode'>
									<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>Start with a free trial</p>
									<Spacer height={'4px'} />
									<p className='text-sm font-normal text-[#71717A] peer-checked:text-gray-700'>
										By default, the subscription will start with a free trial
									</p>
								</Label>
							</div>
						</div>
						<Spacer height={'8px'} />
						<Input placeholder='Enter no. of days in trial period' />
					</div>
				)}
				{activeStep === 1 && (
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
								<Select
									selectedValue='USD'
									options={[
										{ label: 'USD', value: 'USD' },
										{ label: 'INR', value: 'INR' },
									]}
									label='Select Currency'
									placeholder='Select Currency'
								/>
								<Spacer height={'8px'} />
								<Select
									selectedValue='monthly'
									options={[
										{ label: 'Monthly', value: 'monthly' },
										{ label: 'Yearly', value: 'yearly' },
									]}
									label='Billing Period'
									placeholder='Select The Billing Period'
								/>
								<Spacer height={'8px'} />
								<Input label='Value' prefix={'Rs.'} suffix={<span className='text-[#64748B]'>per month</span>} />
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
				)}

				{/* next / back buttons */}
				<Spacer height={'16px'} />
				<div>
					<Button onClick={handleBack} variant='secondary' className='mr-4 text-zinc-900 '>
						Go Back
					</Button>
					<Button onClick={handleNext} variant='default' className='mr-4'>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreatePlanPage;
