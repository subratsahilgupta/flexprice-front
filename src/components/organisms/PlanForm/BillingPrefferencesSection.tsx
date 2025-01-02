import { CheckboxRadioGroup, FormHeader, Input, Spacer } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import usePlanStore from '@/store/usePlanStore';
import { useState } from 'react';

const BillingPrefferencesSection = () => {
	const [trialPeriod, settrialPeriod] = useState(false);
	const { setPlanField, plan, errors } = usePlanStore();

	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Billing Preferences'}
				subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
				variant='sub-header'
			/>

			{/* checkbox radio group */}
			<CheckboxRadioGroup
				title='Billing timing'
				value={plan.invoice_cadence}
				checkboxItems={[
					{ label: 'Advance', value: 'Advance', description: 'At the end of each billing period' },

					{ label: 'Arrear', value: 'Arrear', description: 'Immediately at the event reception' },
				]}
				onChange={(value) => {
					console.log('value', value);
					setPlanField('invoice_cadence', value);
				}}
				error={errors.invoice_cadence}
			/>
			<Spacer height={'16px'} />
			<div>
				<FormHeader title='Trial Period' variant='form-component-title' />
				<div className='flex items-center space-x-4 font-open-sans'>
					<Switch id='airplane-mode' checked={trialPeriod} onCheckedChange={(value) => settrialPeriod(value)} />
					<Label htmlFor='airplane-mode'>
						<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>Start with a free trial</p>
						<Spacer height={'4px'} />
						<p className='text-sm font-normal text-[#71717A] peer-checked:text-gray-700'>
							By default, the subscription will start with a free trial
						</p>
					</Label>
				</div>
			</div>
			{trialPeriod && (
				<div>
					<Spacer height={'8px'} />
					<Input
						value={plan.trial_period}
						onChange={(value) => {
							if (isNaN(Number(value))) {
								return;
							}
							setPlanField('trial_period', Number(value));
						}}
						placeholder='Enter no. of days in trial period'
					/>
				</div>
			)}
		</div>
	);
};

export default BillingPrefferencesSection;
