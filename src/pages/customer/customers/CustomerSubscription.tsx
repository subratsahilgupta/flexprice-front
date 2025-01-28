import { Select, DatePicker, Button, SelectOption, FormHeader } from '@/components/atoms';
import CustomerCard from '@/components/molecules/Customer/CustomerCard';
import Preview from '@/components/organisms/Subscription/Preview';
import ChargeTable from '@/components/organisms/Subscription/PriceTable';
import UsageTable from '@/components/organisms/Subscription/UsageTable';
import { cn } from '@/lib/utils';
import { SubscriptionUsage } from '@/models/Subscription';
import CustomerApi, { CreateCustomerSubscriptionPayload } from '@/utils/api_requests/CustomerApi';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import SubscriptionApi from '@/utils/api_requests/SubscriptionApi';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { NormalizedPlan, normalizePlan } from '@/utils/models/transformed_plan';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

type Params = {
	id: string;
	subscription_id?: string;
};

type SubscriptionState = {
	selectedPlan: string;
	prices: NormalizedPlan | null;
	billingPeriod: string;
	currency: string;
	billingPeriodOptions: SelectOption[];
	startDate: Date | undefined;
	endDate: Date | undefined;
};

const CustomerSubscription: React.FC = () => {
	const { id: customerId, subscription_id } = useParams<Params>();

	const [plans, setPlans] = useState<NormalizedPlan[] | null>(null);
	const [plansLoading, setPlansLoading] = useState(false);
	const [plansError, setPlansError] = useState(false);

	const [susbcriptionData, setSubscriptionData] = useState<SubscriptionUsage | null>(null);
	const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
		selectedPlan: '',
		prices: null,
		billingPeriod: '',
		currency: '',
		billingPeriodOptions: [],
		startDate: new Date(),
		endDate: undefined,
	});

	const navigate = useNavigate();

	// Sequential fetching
	useEffect(() => {
		const fetchData = async () => {
			try {
				setPlansLoading(true);
				const plansResponse = await PlanApi.getActiveExpandedPlan();
				const normalizedPlans = plansResponse.map((plan) => normalizePlan(plan));
				setPlans(normalizedPlans);

				// If subscription_id exists, fetch subscription details
				if (subscription_id) {
					const subscriptionDetails = await CustomerApi.getCustomerSubscriptionById(subscription_id);
					const subscriptionUsage = await SubscriptionApi.getSubscriptionUsage(subscription_id);
					setSubscriptionData(subscriptionUsage);
					const planDetails = normalizedPlans.find((plan) => plan.id === subscriptionDetails.plan_id);
					if (planDetails) {
						setSubscriptionState({
							selectedPlan: subscriptionDetails.plan_id,
							prices: planDetails,
							billingPeriod: subscriptionDetails.billing_period.toLowerCase(),
							currency: subscriptionDetails.currency,
							billingPeriodOptions: Object.keys(planDetails.charges).map((period) => ({
								label: toSentenceCase(period),
								value: period,
							})),
							startDate: new Date(subscriptionDetails.start_date),
							endDate: subscriptionDetails.end_date ? new Date(subscriptionDetails.end_date) : undefined,
						});
					}
				}
			} catch (e) {
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

	// Handle plan change
	const handlePlanChange = (value: string) => {
		const filteredPlan = plans?.find((plan) => plan.id === value);

		if (!filteredPlan || !filteredPlan.charges || Object.keys(filteredPlan.charges).length === 0) {
			toast.error('Invalid plan or no charges available.');
			return;
		}

		const billingPeriods = Object.keys(filteredPlan.charges);
		const defaultBillingPeriod = billingPeriods.includes(subscriptionState.billingPeriod)
			? subscriptionState.billingPeriod
			: billingPeriods[0];

		const currencies = defaultBillingPeriod ? Object.keys(filteredPlan.charges[defaultBillingPeriod]) : [];
		const defaultCurrency = currencies.includes(subscriptionState.currency) ? subscriptionState.currency : currencies[0];

		if (!defaultBillingPeriod || !defaultCurrency) {
			toast.error('Invalid billing period or currency for the selected plan.');
			return;
		}

		setSubscriptionState({
			...subscriptionState,
			selectedPlan: value,
			prices: filteredPlan,
			billingPeriod: defaultBillingPeriod,
			currency: defaultCurrency,
			billingPeriodOptions: billingPeriods.map((period) => ({
				label: toSentenceCase(period),
				value: period,
			})),
		});
	};

	// Handle billing period change
	const handleBillingPeriodChange = (value: string) => {
		const filteredPlan = subscriptionState.prices;
		if (!filteredPlan || !filteredPlan.charges[value]) {
			toast.error('Invalid billing period.');
			return;
		}

		const currencies = Object.keys(filteredPlan.charges[value]);
		const defaultCurrency = currencies.includes(subscriptionState.currency) ? subscriptionState.currency : currencies[0];

		setSubscriptionState({
			...subscriptionState,
			billingPeriod: value,
			currency: defaultCurrency,
		});
	};

	// Handle currency change
	const handleCurrencyChange = (value: string) => {
		setSubscriptionState({
			...subscriptionState,
			currency: value,
		});
	};

	const handleSubscriptionSubmit = () => {
		const { billingPeriod, selectedPlan, currency, startDate, endDate } = subscriptionState;

		if (!billingPeriod || !selectedPlan) {
			toast.error('Please select a plan and billing period.');
			return;
		}

		createSubscription({
			billing_cadence: 'RECURRING',
			billing_period: billingPeriod.toUpperCase(),
			billing_period_count: 1,
			currency,
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
		<div className={cn('flex gap-8 mt-5')}>
			<div className='flex-[6] space-y-6 overflow-y-auto pr-4' style={{ maxHeight: 'calc(100vh - 120px)' }}>
				<CustomerCard customerId={customerId!} subscriptionData={susbcriptionData} />

				{susbcriptionData && susbcriptionData?.charges?.length > 0 && (
					<div>
						<UsageTable data={susbcriptionData!} />
					</div>
				)}
				<div className='p-6 rounded-xl border border-gray-300 space-y-6'>
					<FormHeader title='Subscription Details' variant='sub-header' />

					{/* Select Plan */}
					{!plansLoading && (
						<Select
							selectedValue={subscriptionState.selectedPlan}
							options={
								plans?.map((plan) => ({
									label: plan.name,
									value: plan.id,
								})) ?? []
							}
							onChange={(value) => handlePlanChange(value)}
							label='Plan*'
							disabled={subscription_id !== undefined}
							placeholder='Select plan'
							error={plansError ? 'Failed to load plans' : undefined}
						/>
					)}

					{/* Billing Period */}
					{/* Billing Period */}
					{subscriptionState.selectedPlan && subscriptionState.billingPeriodOptions.length > 0 && (
						<Select
							key={subscriptionState.billingPeriodOptions.map((opt) => opt.value).join(',')} // Force re-render on options change
							selectedValue={subscriptionState.billingPeriod}
							options={subscriptionState.billingPeriodOptions}
							onChange={(value) => handleBillingPeriodChange(value)}
							label='Billing Period*'
							disabled={subscription_id !== undefined}
							placeholder='Select billing period'
						/>
					)}

					{/* Currency */}
					{subscriptionState.selectedPlan &&
						subscriptionState.prices &&
						subscriptionState.prices.charges[subscriptionState.billingPeriod] && (
							<Select
								key={Object.keys(subscriptionState.prices.charges[subscriptionState.billingPeriod]).join(',')} // Force re-render on options change
								selectedValue={subscriptionState.currency}
								options={Object.keys(subscriptionState.prices.charges[subscriptionState.billingPeriod]).map((currency) => ({
									label: currency.toUpperCase(),
									value: currency,
								}))}
								onChange={(value) => handleCurrencyChange(value)}
								label='Select Currency*'
								placeholder='Select currency'
								disabled={subscription_id !== undefined}
							/>
						)}

					{/* Charge Table */}
					{subscriptionState.prices && subscriptionState.selectedPlan && (
						<ChargeTable data={subscriptionState.prices.charges[subscriptionState.billingPeriod][subscriptionState.currency]} />
					)}

					{/* Date Pickers */}
					{subscriptionState.selectedPlan && (
						<div className='flex items-center space-x-4 relative'>
							<div className='relative'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Subscription Start Date</label>
								<DatePicker
									disabled={subscription_id !== undefined}
									date={subscriptionState.startDate}
									setDate={(date) => setSubscriptionState((prev) => ({ ...prev, startDate: date }))}
								/>
								{/* Overlay to block clicks */}
							</div>
							<div className='relative'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Subscription End Date</label>
								<DatePicker
									disabled={subscription_id !== undefined}
									date={subscriptionState.endDate}
									setDate={(date) => setSubscriptionState((prev) => ({ ...prev, endDate: date }))}
									placeholder='Forever'
								/>
								{/* Overlay to block clicks */}
							</div>
						</div>
					)}
				</div>

				{/* Submit Buttons */}
				{subscriptionState.selectedPlan && !subscription_id && (
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
			<div className='flex-[4]'>
				{subscriptionState.selectedPlan && !susbcriptionData && (
					<Preview
						startDate={subscriptionState.startDate}
						data={subscriptionState.prices?.charges[subscriptionState.billingPeriod][subscriptionState.currency] ?? []}
					/>
				)}
			</div>
		</div>
	);
};

export default CustomerSubscription;
