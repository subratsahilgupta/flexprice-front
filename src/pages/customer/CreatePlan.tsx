import { Button, FormHeader, Spacer, Stepper } from '@/components/atoms';
import { BillingPrefferencesSection, PlanDetailsSection, SetupChargesSection } from '@/components/organisms';
import { useState } from 'react';

const CreatePlanPage = () => {
	const [activeStep, setactiveStep] = useState(0);
	const formSteps = [{ label: 'Plan Details' }, { label: 'Billing Preferences' }, { label: 'Set up Charges' }];

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

				{activeStep === 0 && <PlanDetailsSection />}
				{activeStep === 1 && <BillingPrefferencesSection />}
				{activeStep === 2 && <SetupChargesSection />}

				{/* next / back buttons */}
				<Spacer height={'16px'} />
				<div>
					{activeStep > 0 && (
						<Button onClick={handleBack} variant='secondary' className='mr-4 text-zinc-900 '>
							Go Back
						</Button>
					)}

					{activeStep === 0 && (
						<Button onClick={handleBack} variant='secondary' className='mr-4 text-zinc-900 '>
							Save Draft
						</Button>
					)}
					<Button onClick={handleNext} variant='default' className='mr-4'>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreatePlanPage;
