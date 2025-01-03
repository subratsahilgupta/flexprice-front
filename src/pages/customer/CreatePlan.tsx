import { Button, FormHeader, Spacer, Stepper } from '@/components/atoms';
import { BillingPrefferencesSection, PlanDetailsSection, SetupChargesSection } from '@/components/organisms';
import usePlanStore from '@/store/usePlanStore';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CreatePlanPage = () => {
	const [activeStep, setactiveStep] = useState(2);
	const formSteps = [{ label: 'Plan Details' }, { label: 'Billing Preferences' }, { label: 'Set up Charges' }];
	const { setError, clearAllErrors, clearPlan } = usePlanStore();
	const plan = usePlanStore((state) => state.plan);
	const metaData = usePlanStore((state) => state.metaData);

	useEffect(() => {
		return () => {
			clearPlan();
		};
	}, []);

	const { mutate: submitPlan } = useMutation({
		mutationFn: async () => {
			const response = await PlanApi.createPlan({ ...plan, prices: [metaData?.recurringPrice ?? {}, metaData?.usageBasedPrice ?? {}] });
			return response;
		},
		onSuccess() {
			toast.success('Plan created successfully');
		},
		onError() {
			toast.error('Failed to create plan');
		},
	});

	const handleNext = () => {
		if (activeStep === formSteps.length - 1) {
			if (!validateSteps()) {
				return;
			}
			console.log('Form submitted successfully', plan);
			submitPlan();
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
			// if (!plan.prices || plan.prices.length === 0) {
			// 	setError('prices', 'At least one price tier is required');
			// 	return false;
			// }
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
						{formSteps.length - 1 === activeStep ? 'Save' : 'Next'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreatePlanPage;
