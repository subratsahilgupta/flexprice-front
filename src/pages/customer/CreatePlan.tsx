import { Button, FormHeader, Spacer, Stepper } from '@/components/atoms';
import { BillingPrefferencesSection, PlanDetailsSection, SetupChargesSection } from '@/components/organisms';
import usePlanStore from '@/store/usePlanStore';
import { useEffect, useState } from 'react';

const CreatePlanPage = () => {
	const [activeStep, setactiveStep] = useState(2);
	const formSteps = [{ label: 'Plan Details' }, { label: 'Billing Preferences' }, { label: 'Set up Charges' }];
	const { plan, setError, clearAllErrors, clearPlan, metaData } = usePlanStore();

	useEffect(() => {
		return () => {
			clearPlan();
		};
	}, []);

	const handleNext = () => {
		if (activeStep === formSteps.length - 1) {
			if (!validateSteps()) {
				return;
			}
			console.log('Form submitted successfully', plan);
			// Add form submission logic here
			return;
		}
		if (!validateSteps()) {
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

	const validateSteps = () => {
		clearAllErrors();
		if (activeStep === 0) {
			if (!plan.name) {
				setError('name', 'Plan name is required');
				return false;
			}
			if (!plan.lookup_key) {
				setError('lookup_key', 'Plan slug is required');
				return false;
			}
		} else if (activeStep === 1) {
			if (!plan.invoice_cadence) {
				setError('invoice_cadence', 'Billing Timing is required');
				return false;
			}
			if (metaData?.isTrialPeriod && !plan.trial_period) {
				setError('trial_period', 'Trial period is required');
				return false;
			}
		} else if (activeStep === 2) {
			if (!plan.prices || plan.prices.length === 0) {
				setError('prices', 'At least one price tier is required');
				return false;
			}
		}

		return true;
	};

	return (
		<div className='p-6'>
			<FormHeader title={'Plan Details'} subtitle={'Create a new plan by filling in the details below.'} variant='form-title' />

			<Spacer height={'16px'} />

			{/* stepper componenet */}
			<div className='md:w-1/2 lg:w-2/3 '>
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
			<pre className='text-white'>{JSON.stringify(plan, null, 2)}</pre>
		</div>
	);
};

export default CreatePlanPage;
