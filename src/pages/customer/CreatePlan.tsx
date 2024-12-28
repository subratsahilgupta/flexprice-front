import { FormHeader, Stepper } from '@/components/atoms';

const CreatePlanPage = () => {
	return (
		<div className='p-6'>
			<FormHeader title={'Plan Details'} subtitle={'Create a new plan by filling in the details below.'} variant='form-title' />

			{/* stepper componenet */}
			<div className='max-w-2xl mt-4'>
				<Stepper
					activeStep={2}
					steps={[{ label: 'Plan Details' }, { label: 'Plan Features' }, { label: 'Plan Pricing' }, { label: 'Plan Preview' }]}
				/>

				{/* Plan Features */}
				<div className='p-6 rounded-xl border border-[#E4E4E7] mt-4'>
					<FormHeader
						title={'Billing Preferences'}
						subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
						variant='sub-header'
					/>
				</div>
			</div>
		</div>
	);
};

export default CreatePlanPage;
