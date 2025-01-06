'use client';

import { Select, DatePicker, Button } from '@/components/atoms';
import CustomerCard from '@/components/molecules/Customer/CustomerCard';
import Preview from '@/components/organisms/Subscription/Preview';
import ChargeTable from '@/components/organisms/Subscription/PriceTable';
import CustomerApi, { CreateCustomerSubscriptionPayload } from '@/utils/api_requests/CustomerApi';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { NormalizedPlan, normalizePlan } from '@/utils/models/transformed_plan';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

type Params = {
	id: string;
	subscription_id?: string;
};

const CustomerSubscription: React.FC = () => {
	const { id: customerId, subscription_id } = useParams<Params>();

	const [plans, setPlans] = useState<NormalizedPlan[] | null>(null);
	const [plansLoading, setPlansLoading] = useState(false);
	const [plansError, setPlansError] = useState(false);

	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [prices, setPrices] = useState<NormalizedPlan | null>(null);
	const [billingPeriodOptions, setBillingPeriodOptions] = useState<string[]>([]);
	const [billingPeriod, setBillingPeriod] = useState<string | null>(null);
	const [currency, setCurrency] = useState<string>('usd');
	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	const navigate = useNavigate();

	// Sequential fetching
	useEffect(() => {
		const fetchData = async () => {
			try {
				setPlansLoading(true);
				// Fetch all plans
				const plansResponse = await PlanApi.getExpandedPlan();
				const normalizedPlans = plansResponse.map((plan) => normalizePlan(plan));
				setPlans(normalizedPlans);

				// If subscription_id exists, fetch subscription details
				if (subscription_id) {
					const subscriptionDetails = await CustomerApi.getCustomerSubscriptionById(subscription_id);

					// Populate subscription details
					const planDetails = normalizedPlans.find((plan) => plan.id === subscriptionDetails.plan_id);
					if (planDetails) {
						setSelectedPlan(subscriptionDetails.plan_id);
						setStartDate(new Date(subscriptionDetails.start_date));
						setEndDate(subscriptionDetails.end_date ? new Date(subscriptionDetails.end_date) : undefined);
						setPrices(planDetails);
						setBillingPeriodOptions(Object.keys(planDetails.charges));
						setBillingPeriod(subscriptionDetails.billing_period.toLowerCase());
					}
				}
			} catch (error) {
				setPlansError(true);
				toast.error('Failed to load plans or subscription details');
			} finally {
				setPlansLoading(false);
			}
		};

		fetchData();
	}, [subscription_id]);

	const { mutate: createSubscription, isPending: isCreating } = useMutation({
		mutationKey: ['createSubscription'],
		mutationFn: async (data: CreateCustomerSubscriptionPayload) => {
			return await CustomerApi.createCustomerSubscription(data);
		},
		retry: 1,
		onSuccess: async () => {
			toast.success('Subscription created successfully');
			navigate(`/customer-management/customers/${customerId}`);
		},
		onError: () => {
			toast.error('Error creating subscription');
		},
	});

	const handleSubscriptionSubmit = () => {
		if (!billingPeriod || !selectedPlan) {
			toast.error('Please select a plan and billing period.');
			return;
		}

		createSubscription({
			billing_cadence: 'RECURRING',
			billing_period: billingPeriod.toUpperCase(),
			billing_period_count: 1,
			currency: currency,
			customer_id: customerId!,
			invoice_cadence: 'ARREAR',
			plan_id: selectedPlan,
			start_date: startDate?.toISOString() ?? '',
			end_date: endDate?.toISOString() ?? null,
			lookup_key: '',
			trial_end: null,
			trial_start: null,
		});
	};

	const navigateBack = () => {
		navigate(`/customer-management/customers/details/${customerId}`);
	};

	return (
		<div className='flex gap-8 mt-5'>
			<div
				className='flex-[6] space-y-6 overflow-y-auto pr-4'
				style={{
					maxHeight: 'calc(100vh - 120px)',
					overflowY: 'auto',
					scrollbarWidth: 'thin',
					WebkitOverflowScrolling: 'touch',
				}}>
				<CustomerCard customerId={customerId!} />

				<div className='p-6 rounded-xl border border-gray-300 space-y-6'>
					<h1 className='text-base font-bold mb-1 text-gray-800'>Subscription Details</h1>

					{/* Select Plan */}
					{!plansLoading && (
						<Select
							selectedValue={selectedPlan ?? ''}
							options={
								plans?.map((plan) => ({
									label: plan.name,
									value: plan.id,
								})) ?? []
							}
							onChange={(value) => {
								const filteredPlan = plans?.find((plan) => plan.id === value);
								const defaultBillingPeriod = Object.keys(filteredPlan!.charges)[0];
								setBillingPeriodOptions(Object.keys(filteredPlan!.charges));
								setBillingPeriod(defaultBillingPeriod);
								setPrices(filteredPlan!);
								setSelectedPlan(value);
							}}
							label='Select Plan*'
							placeholder='Select plan'
							error={plansError ? 'Failed to load plans' : undefined}
						/>
					)}

					{/* Billing Period and Currency */}
					{prices && (
						<>
							<Select
								selectedValue={billingPeriod ?? ''}
								options={billingPeriodOptions.map((period) => ({
									label: period,
									value: period,
								}))}
								onChange={(value) => setBillingPeriod(value)}
								label='Select Billing Period*'
								placeholder='Select billing period'
							/>

							<Select
								selectedValue={currency!}
								options={[
									{ label: 'USD', value: 'usd' },
									{ label: 'INR', value: 'inr' },
								]}
								disabled
								onChange={(value) => setCurrency(value)}
								label='Select Currency*'
								placeholder='Select currency'
							/>

							<ChargeTable data={prices.charges[billingPeriod!]} />
						</>
					)}

					{/* Date Pickers */}
					{selectedPlan && (
						<div className='flex items-center space-x-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Subscription Start Date</label>
								<DatePicker date={startDate} setDate={setStartDate} />
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Subscription End Date</label>
								<DatePicker date={endDate} setDate={setEndDate} placeholder='Forever' />
							</div>
						</div>
					)}
				</div>

				{selectedPlan && !subscription_id && (
					<div className='flex items-center justify-start space-x-4'>
						<Button onClick={navigateBack} className='bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-primary-dark'>
							Cancel
						</Button>
						<Button
							onClick={handleSubscriptionSubmit}
							loading={isCreating}
							className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark'>
							Add Subscription
						</Button>
					</div>
				)}
			</div>

			{/* Preview */}
			<div className='flex-[4]'>{selectedPlan && <Preview data={prices?.charges[billingPeriod!] ?? []} />}</div>
		</div>
	);
};

export default CustomerSubscription;
