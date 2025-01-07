import { Select, DatePicker, Button } from '@/components/atoms';
import CustomerCard from '@/components/molecules/Customer/CustomerCard';
import Preview from '@/components/organisms/Subscription/Preview';
import ChargeTable from '@/components/organisms/Subscription/PriceTable';
import CustomerApi, { CreateCustomerSubscriptionPayload } from '@/utils/api_requests/CustomerApi';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { NormalizedPlan, normalizePlan } from '@/utils/models/transformed_plan';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const fetchPlans = async () => {
	const plans = await PlanApi.getExpandedPlan();
	const modifiedPlans = plans.map((plan) => normalizePlan(plan));
	return modifiedPlans;
};

const CustomerSubscription = () => {
	const { id: customerId } = useParams();

	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [prices, setPrices] = useState<NormalizedPlan | null>(null);
	const [billingPeriodOptions, setBillingPeriodOptions] = useState<string[]>([]);
	const [billingPeriod, setBillingPeriod] = useState<string | null>(null);
	const [currency, setCurrency] = useState<string>('usd');
	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	// Fetch plans
	const {
		data: plans,
		isLoading: plansLoading,
		isError: plansError,
	} = useQuery({
		queryKey: ['fetchPlans'],
		queryFn: fetchPlans,
		retry: 2,
		staleTime: 1000 * 60 * 5,
	});

	const navigate = useNavigate();

	const { mutate: createSubscription, isPending: isCreating } = useMutation({
		mutationKey: ['createSubscription'],
		mutationFn: async (data: CreateCustomerSubscriptionPayload) => {
			return await CustomerApi.createCustomerSubscription(data);
		},
		retry: 1,
		onSuccess: async () => {
			toast.success('Subscription created successfully');
			navigate(`/customer-management/customers/details/${customerId}`);
		},
		onError: () => {
			toast.error('Error creating subscription');
		},
	});

	const handleSubscriptionSubmit = () => {
		createSubscription({
			billing_cadence: 'RECURRING',
			billing_period: billingPeriod!.toUpperCase()!,
			billing_period_count: 1,
			currency: currency,
			customer_id: customerId!,
			invoice_cadence: 'ARREAR',
			plan_id: selectedPlan!,
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
			{/* Left Container - Scrollable */}
			<div
				className='flex-[6] space-y-6 overflow-y-auto pr-4'
				style={{
					maxHeight: 'calc(100vh - 120px)', // Adjust based on your header/footer height
					overflowY: 'auto',
					scrollbarWidth: 'thin',
					WebkitOverflowScrolling: 'touch',
				}}>
				<CustomerCard customerId={customerId!} />

				<div className='p-6 rounded-xl border border-gray-300 space-y-6'>
					<div>
						<h1 className='text-base font-bold mb-1 text-gray-800'>Subscription Details</h1>
						<p className='text-sm text-gray-600'>Assign a name to your event schema to easily identify and track events processed.</p>
					</div>

					{/* Select Plan Dropdown */}
					{!plansLoading && (
						<Select
							selectedValue={selectedPlan ?? ''}
							options={
								plans?.map((plan) => ({
									label: plan!.name,
									value: plan!.id,
								})) ?? []
							}
							onChange={(value) => {
								const filteredPlan = plans?.find((plan) => plan!.id === value);
								const billingPeriod = Object.keys(filteredPlan!.charges)[0];
								console.log('filteredPlan', filteredPlan);
								console.log('billingPeriod', billingPeriod);
								setBillingPeriodOptions(Object.keys(filteredPlan!.charges));
								setBillingPeriod(billingPeriod);
								setPrices(filteredPlan!);
								setSelectedPlan(value);
							}}
							label='Plan*'
							placeholder='Select plan'
							error={plansError ? 'Failed to load plans' : undefined}
						/>
					)}

					{prices && (
						<>
							<Select
								selectedValue={billingPeriod ?? ''}
								options={billingPeriodOptions.map((billingPeriod) => ({
									label: toSentenceCase(billingPeriod),
									value: billingPeriod,
								}))}
								onChange={(value) => setBillingPeriod(value)}
								label='Billing Period*'
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

							{prices.charges[billingPeriod!] && <ChargeTable data={prices.charges[billingPeriod!]} />}
						</>
					)}

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
				</div>

				<div className='flex items-center justify-start space-x-4'>
					<Button onClick={navigateBack} className='bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-primary-dark'>
						{'Cancel'}
					</Button>
					<Button
						onClick={handleSubscriptionSubmit}
						loading={isCreating}
						className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark'>
						{'Add Subscription'}
					</Button>
				</div>
			</div>

			{/* Right Container - Static */}
			<div className='flex-[4]'>{selectedPlan && <Preview data={prices?.charges[billingPeriod!] ?? []} />}</div>
		</div>
	);
};

export default CustomerSubscription;
