import { CheckboxRadioGroup, FormHeader, Input, Spacer } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import usePlanStore from '@/store/usePlanStore';

const BillingPrefferencesSection = () => {
	const { setPlanField, plan, errors, metaData, setMetaDataField } = usePlanStore();

	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Billing Preferences'}
				subtitle={'Customize the billing structure for your pricing plan to align with your revenue model.'}
				variant='sub-header'
			/>

			{/* checkbox radio group */}
			<CheckboxRadioGroup
				title='Billing timing'
				value={plan.invoice_cadence}
				checkboxItems={[
					{ label: 'Advance', value: 'ADVANCE', description: 'Customers are billed at the start of each billing period.' },

					{
						label: 'Arrear',
						value: 'ARREAR',
						description: 'Customers are billed at the end of each billing period, based on actual usage.',
					},
				]}
				onChange={(value) => {
					setPlanField('invoice_cadence', value);
				}}
				error={errors.invoice_cadence}
			/>
			<Spacer height={'16px'} />
			<div>
				<FormHeader title='Trial Period' variant='form-component-title' />
				<div className='flex items-center space-x-4 font-open-sans'>
					<Switch
						id='airplane-mode'
						checked={metaData?.isTrialPeriod}
						onCheckedChange={(value) => {
							setMetaDataField('isTrialPeriod', value);
							setPlanField('trial_period', undefined);
						}}
					/>
					<Label htmlFor='airplane-mode'>
						<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>Start with a free trial</p>
						<Spacer height={'4px'} />
						<p className='text-sm font-normal text-[#71717A] peer-checked:text-gray-700'>
							Enable this option to add a free trial period for the subscription.
						</p>
					</Label>
				</div>
			</div>
			{metaData?.isTrialPeriod && (
				<div>
					<Spacer height={'8px'} />
					<Input
						error={errors.trial_period}
						value={plan.trial_period}
						onChange={(value) => {
							if (isNaN(Number(value))) {
								return;
							}
							setPlanField('trial_period', Number(value));
						}}
						suffix='days'
						placeholder='Enter no. of days in trial period'
					/>
				</div>
			)}
		</div>
	);
};

export default BillingPrefferencesSection;
