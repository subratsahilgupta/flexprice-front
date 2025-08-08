import { Button, SelectOption } from '@/components/atoms';
import Preview from '@/components/organisms/Subscription/Preview';
import UsageTable from '@/components/organisms/Subscription/UsageTable';
import { cn } from '@/lib/utils';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import CustomerApi from '@/api/CustomerApi';
import { PlanApi } from '@/api/PlanApi';
import SubscriptionApi from '@/api/SubscriptionApi';
import CouponApi from '@/api/CouponApi';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { ExpandedPlan } from '@/types/plan';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiDocsContent, CouponModal } from '@/components/molecules';
import { Trash2 } from 'lucide-react';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { RouteNames } from '@/core/routes/Routes';
import { BILLING_CYCLE, SubscriptionPhase } from '@/models/Subscription';
import { CreateSubscriptionPayload } from '@/types/dto/Subscription';
import { BILLING_CADENCE, INVOICE_CADENCE } from '@/models/Invoice';
import { BILLING_PERIOD } from '@/constants/constants';
import { uniqueId } from 'lodash';
import SubscriptionForm from '@/components/organisms/Subscription/SubscriptionForm';
import { getLineItemOverrides } from '@/utils/common/price_override_helpers';
import { Coupon } from '@/models/Coupon';
import formatCouponName from '@/utils/common/format_coupon_name';
import filterValidCoupons from '@/utils/helpers/coupons';
import TaxApi from '@/api/TaxApi';
import { TAXRATE_ENTITY_TYPE } from '@/models/Tax';
import { TaxRateOverride } from '@/types/dto/tax';
import { EXPAND } from '@/models/expand';

type Params = {
	id: string;
	subscription_id?: string;
};

export enum SubscriptionPhaseState {
	EDIT = 'edit',
	SAVED = 'saved',
	NEW = 'new',
}

export type SubscriptionFormState = {
	selectedPlan: string;
	prices: ExpandedPlan | null;
	billingPeriod: BILLING_PERIOD;
	currency: string;
	billingPeriodOptions: SelectOption[];

	// Subscription Phase
	phases: SubscriptionPhase[];
	selectedPhase: number;
	phaseStates: SubscriptionPhaseState[];
	isPhaseEditing: boolean;
	originalPhases: SubscriptionPhase[];

	// Price Overrides
	priceOverrides: Record<string, string>;

	// Coupons
	linkedCoupon: Coupon | null;
	customerId: string;

	// Tax Rate Overrides
	tax_rate_overrides: TaxRateOverride[];
};

// Data Fetching Hooks
const usePlans = () => {
	return useQuery({
		queryKey: ['plans'],
		queryFn: async () => {
			const plansResponse = await PlanApi.getActiveExpandedPlan({ limit: 1000, offset: 0 });

			try {
				const filteredPlans = plansResponse.filter((plan) => {
					const hasPrices = plan.prices && plan.prices.length > 0;
					return hasPrices;
				});

				return filteredPlans;
			} catch (error) {
				toast.error('Error processing plans data');
				throw error;
			}
		},
	});
};

const useCustomerData = (customerId: string | undefined) => {
	return useQuery({
		queryKey: ['customerSubscription', customerId],
		queryFn: () => CustomerApi.getCustomerById(customerId!),
		enabled: !!customerId,
	});
};

const useSubscriptionData = (subscription_id: string | undefined) => {
	return useQuery({
		queryKey: ['subscription', subscription_id],
		queryFn: async () => {
			const [details, usage] = await Promise.all([
				CustomerApi.getCustomerSubscriptionById(subscription_id!),
				SubscriptionApi.getSubscriptionUsage(subscription_id!),
			]);
			return { details, usage };
		},
		enabled: !!subscription_id,
	});
};

const useAvailableCoupons = () => {
	return useQuery({
		queryKey: ['availableCoupons'],
		queryFn: async () => {
			const response = await CouponApi.getAllCoupons({ limit: 1000, offset: 0 });
			return filterValidCoupons(response.items);
		},
	});
};

const CustomerSubscription: React.FC = () => {
	const { id: customerId, subscription_id } = useParams<Params>();
	const navigate = useNavigate();
	const updateBreadcrumb = useBreadcrumbsStore((state) => state.updateBreadcrumb);

	// Fetch data using React Query
	const { data: plans, isLoading: plansLoading, isError: plansError } = usePlans();
	const { data: customerData } = useCustomerData(customerId);
	const { data: subscriptionData } = useSubscriptionData(subscription_id);
	const { data: availableCoupons = [] } = useAvailableCoupons();
	const { data: customerTaxAssociations } = useQuery({
		queryKey: ['customerTaxAssociations', customerId],
		queryFn: async () => {
			return await TaxApi.listTaxAssociations({
				limit: 100,
				offset: 0,
				entity_id: customerId!,
				expand: EXPAND.TAX_RATE,
				entity_type: TAXRATE_ENTITY_TYPE.CUSTOMER,
			});
		},
		enabled: !!customerId,
	});

	useEffect(() => {
		if (customerTaxAssociations?.items) {
			setSubscriptionState((prev) => ({
				...prev,
				tax_rate_overrides: customerTaxAssociations.items.map((item) => ({
					tax_rate_id: item.tax_rate_id,
					tax_rate_code: item.tax_rate?.code ?? '',
					currency: item.currency.toLowerCase(),
					auto_apply: item.auto_apply,
					priority: item.priority,
					tax_rate_name: item.tax_rate?.name ?? '',
				})),
			}));
		}
	}, [customerTaxAssociations]);

	// Local state
	const [subscriptionState, setSubscriptionState] = useState<SubscriptionFormState>({
		selectedPlan: '',
		prices: null,
		billingPeriod: BILLING_PERIOD.MONTHLY,
		currency: '',
		billingPeriodOptions: [],
		phases: [],
		selectedPhase: 0,
		phaseStates: [],
		isPhaseEditing: false,
		originalPhases: [],
		priceOverrides: {},
		linkedCoupon: null,
		customerId: customerId!,
		tax_rate_overrides: [],
	});

	const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

	// Filter coupons by currency
	const currencyFilteredCoupons = useMemo(() => {
		if (!subscriptionState.currency) {
			return availableCoupons;
		}
		return filterValidCoupons(availableCoupons, subscriptionState.currency);
	}, [availableCoupons, subscriptionState.currency]);

	const handleCouponSelect = (couponId: string) => {
		const coupon = currencyFilteredCoupons.find((c) => c.id === couponId);
		if (coupon) {
			setSubscriptionState((prev) => ({ ...prev, linkedCoupon: coupon }));
		}
		setIsCouponModalOpen(false);
	};

	// Update breadcrumb when customer data changes
	useEffect(() => {
		if (customerData?.external_id) {
			updateBreadcrumb(2, customerData.external_id);
		}
	}, [customerData, updateBreadcrumb]);

	// Initialize subscription state when subscription data is available
	useEffect(() => {
		if (subscriptionData?.details && plans) {
			const planDetails = plans.find((plan) => plan.id === subscriptionData.details.plan_id);
			if (planDetails) {
				// Create initial phase
				const initialPhase: Partial<SubscriptionPhase> = {
					billing_cycle: subscriptionData.details.billing_cycle as BILLING_CYCLE,
					start_date: new Date(subscriptionData.details.start_date),
					end_date: subscriptionData.details.end_date ? new Date(subscriptionData.details.end_date) : null,
					line_items: [],
					credit_grants: [],
					prorate_charges: false,
				};

				// Get available billing periods and currencies
				const billingPeriods = [...new Set(planDetails.prices?.map((price) => price.billing_period) || [])];

				setSubscriptionState({
					selectedPlan: subscriptionData.details.plan_id,
					prices: planDetails,
					billingPeriod: subscriptionData.details.billing_period.toLowerCase() as BILLING_PERIOD,
					currency: subscriptionData.details.currency,
					billingPeriodOptions: billingPeriods.map((period) => ({
						label: toSentenceCase(period.replace('_', ' ')),
						value: period,
					})),
					phases: [initialPhase as SubscriptionPhase],
					selectedPhase: 0,
					phaseStates: [SubscriptionPhaseState.SAVED],
					isPhaseEditing: false,
					originalPhases: [initialPhase as SubscriptionPhase],
					priceOverrides: {},
					linkedCoupon: null,
					customerId: customerId!,
					tax_rate_overrides: [],
				});
			}
		}
	}, [subscriptionData, plans, customerId]);

	// Create subscription mutation
	const { mutate: createSubscription, isPending: isCreating } = useMutation({
		mutationKey: ['createSubscription'],
		mutationFn: async (data: CreateSubscriptionPayload) => {
			return await SubscriptionApi.createSubscription(data);
		},
		onSuccess: async () => {
			toast.success('Subscription created successfully');

			refetchQueries(['debug-customers']);
			refetchQueries(['debug-subscriptions']);

			navigate(`${RouteNames.customers}/${customerId}`);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Error creating subscription');
		},
	});

	const handleSubscriptionSubmit = () => {
		const { billingPeriod, selectedPlan, currency, phases, priceOverrides, prices, linkedCoupon, tax_rate_overrides } = subscriptionState;

		if (!billingPeriod || !selectedPlan) {
			toast.error('Please select a plan and billing period.');
			return;
		}

		if (phases.length === 0) {
			toast.error('Please add at least one phase.');
			return;
		}

		phases.forEach((phase, index) => {
			if (!phase.billing_cycle) {
				toast.error(`Please select a billing cycle for ${index + 1}	phase`);
				return;
			}

			if (!phase.start_date) {
				toast.error(`Please select a start date for ${index + 1}	phase`);
				return;
			}
		});

		// Check for any unsaved changes
		if (subscriptionState.isPhaseEditing && subscriptionState.phases.length > 1) {
			toast.error('Please save your changes before submitting.');
			return;
		}

		// Get price overrides for backend
		const currentPrices =
			prices?.prices?.filter(
				(price) =>
					price.billing_period.toLowerCase() === billingPeriod.toLowerCase() && price.currency.toLowerCase() === currency.toLowerCase(),
			) || [];
		const overrideLineItems = getLineItemOverrides(currentPrices, priceOverrides);

		// TODO: Remove this once the feature is released
		const tempSubscriptionId = uniqueId('tempsubscription_');
		const sanitizedPhases = phases.map((phase) => {
			const phaseCreditGrants = phase.credit_grants?.map((grant) => ({
				...grant,
				id: undefined as any,
				currency: currency.toLowerCase(),
				subscription_id: tempSubscriptionId,
				period: grant.period,
			}));
			return {
				...phase,
				start_date: phase.start_date,
				end_date: phase.end_date,
				commitment_amount: phase.commitment_amount,
				overage_factor: phase.overage_factor ?? 1,
				credit_grants: Array.isArray(phaseCreditGrants) && phaseCreditGrants.length > 0 ? phaseCreditGrants : undefined,
			};
		});
		const firstPhase = sanitizedPhases[0];

		const payload: CreateSubscriptionPayload = {
			billing_cadence: BILLING_CADENCE.RECURRING,
			billing_period: billingPeriod.toUpperCase() as BILLING_PERIOD,
			billing_period_count: 1,

			// TODO: remove lower case currency after the feature is released
			currency: currency.toLowerCase(),
			customer_id: customerId!,
			invoice_cadence: INVOICE_CADENCE.ARREAR,
			plan_id: selectedPlan,
			start_date: (firstPhase.start_date as Date).toISOString(),
			end_date: firstPhase.end_date ? (firstPhase.end_date as Date).toISOString() : null,
			lookup_key: '',
			trial_end: null,
			trial_start: null,
			billing_cycle: firstPhase.billing_cycle,
			phases: sanitizedPhases.length > 1 ? sanitizedPhases : undefined,
			credit_grants: (firstPhase.credit_grants?.length ?? 0 > 0) ? firstPhase.credit_grants : undefined,
			commitment_amount: firstPhase.commitment_amount,
			override_line_items: overrideLineItems.length > 0 ? overrideLineItems : undefined,
			subscription_coupons: linkedCoupon ? [linkedCoupon.id] : undefined,

			// TODO: remove this once the feature is released
			overage_factor: firstPhase.overage_factor ?? 1,

			// Tax rate overrides
			tax_rate_overrides: tax_rate_overrides.length > 0 ? tax_rate_overrides : undefined,
		};

		createSubscription(payload);
	};

	const navigateBack = () => navigate(`${RouteNames.customers}/${customerId}`);

	const showPreview = subscriptionState.selectedPlan && !subscriptionData?.usage;

	return (
		<div className={cn('flex gap-8 mt-5 relative mb-12')}>
			<ApiDocsContent tags={['Subscriptions']} />
			<div className='flex-[6] space-y-6 mb-12 overflow-y-auto pr-4'>
				{subscriptionData?.usage?.charges && subscriptionData.usage.charges.length > 0 && (
					<div>
						<UsageTable data={subscriptionData.usage} />
					</div>
				)}

				<SubscriptionForm
					state={subscriptionState}
					setState={setSubscriptionState}
					plans={plans}
					plansLoading={plansLoading}
					plansError={plansError}
					isDisabled={!!subscription_id}
				/>

				{subscriptionState.selectedPlan && (
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<h3 className='text-lg font-medium'>Add Coupon</h3>
							{!subscriptionState.linkedCoupon && (
								<Button onClick={() => setIsCouponModalOpen(true)} variant='outline' size='sm'>
									Add Coupon
								</Button>
							)}
						</div>
						{subscriptionState.linkedCoupon ? (
							<div className='flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								<div className='flex-1'>
									<p className='text-sm text-[#09090B]'>
										<span className='font-semibold'>{subscriptionState.linkedCoupon.name}</span>
										<span className='text-[#71717A] font-medium'> - {formatCouponName(subscriptionState.linkedCoupon)}</span>
									</p>
								</div>
								<Button
									onClick={() => {
										setSubscriptionState((prev) => ({
											...prev,
											linkedCoupon: null,
										}));
									}}
									variant='ghost'
									size='sm'
									className='h-8 w-8 p-0 hover:bg-blue-200 hover:text-blue-600'>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						) : (
							<p className='text-sm text-[#71717A]'>No coupon linked</p>
						)}
					</div>
				)}

				<CouponModal
					isOpen={isCouponModalOpen}
					onOpenChange={setIsCouponModalOpen}
					coupons={currencyFilteredCoupons}
					onSave={handleCouponSelect}
					onCancel={() => setIsCouponModalOpen(false)}
				/>

				{subscriptionState.selectedPlan && !subscription_id && (
					<div className='flex items-center justify-start space-x-4'>
						<Button onClick={navigateBack} variant={'outline'}>
							Cancel
						</Button>
						<Button onClick={handleSubscriptionSubmit} isLoading={isCreating}>
							Add Subscription
						</Button>
					</div>
				)}
			</div>

			<div className='flex-[4]'>
				<div className='sticky top-6'>
					{showPreview && (
						<Preview
							data={
								subscriptionState.prices?.prices?.filter(
									(price) =>
										price.billing_period.toLowerCase() === subscriptionState.billingPeriod.toLowerCase() &&
										price.currency.toLowerCase() === subscriptionState.currency.toLowerCase(),
								) || []
							}
							selectedPlan={subscriptionState.prices}
							phases={subscriptionState.phases}
							coupons={subscriptionState.linkedCoupon ? [subscriptionState.linkedCoupon] : []}
							priceOverrides={subscriptionState.priceOverrides}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default CustomerSubscription;
