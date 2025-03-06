import { Loader, Page, Select } from '@/components/atoms';
import usePagination from '@/hooks/usePagination';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { billlingPeriodOptions } from '@/core/data/constants';
import { useState, useMemo } from 'react';
import { ExpandedPlan } from '@/utils/models/transformed_plan';
import { GetAllPlansResponse } from '@/utils/api_requests/PlanApi';
import PricingCard, { PricingCardProps } from '@/components/molecules/PricingCard';

const PricingPlansView = () => {
	const { limit, offset, page } = usePagination();
	const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<string>('');
	const [selectedCurrency, setSelectedCurrency] = useState<string>('');

	const fetchPlans = async () => {
		return await PlanApi.getAllPlans({
			limit,
			offset,
		});
	};

	const {
		data: plansData,
		isLoading,
		isError,
	} = useQuery<GetAllPlansResponse>({
		queryKey: ['fetchPlans', page],
		queryFn: fetchPlans,
	});

	// Extract unique currencies and billing periods, and get filtered plans
	const { uniqueCurrencies, uniqueBillingPeriods, filteredPlans } = useMemo(() => {
		if (!plansData?.items) {
			return { uniqueCurrencies: [], uniqueBillingPeriods: [], filteredPlans: [] };
		}

		const currencies = new Set<string>();
		const billingPeriods = new Set<string>();
		const plans = plansData.items as ExpandedPlan[];

		// Collect unique currencies and billing periods
		plans.forEach((plan) => {
			plan.prices?.forEach((price) => {
				currencies.add(price.currency);
				billingPeriods.add(price.billing_period);
			});
		});

		// Create initial options arrays
		const allCurrencyOptions = Array.from(currencies).map((currency) => ({
			label: currency.toUpperCase(),
			value: currency.toUpperCase(),
		}));

		const allPeriodOptions = billlingPeriodOptions;

		// Filter currency options based on selected billing period
		const availableCurrencyOptions = selectedBillingPeriod
			? allCurrencyOptions.filter((currency) => {
					// Check if this currency has any plans with the selected billing period
					return plans.some((plan) =>
						plan.prices?.some((price) => price.currency.toUpperCase() === currency.value && price.billing_period === selectedBillingPeriod),
					);
				})
			: allCurrencyOptions;

		// Filter billing period options based on selected currency
		const availablePeriodOptions = selectedCurrency
			? allPeriodOptions.filter((period) => {
					// Check if this period has any plans with the selected currency
					return plans.some((plan) =>
						plan.prices?.some((price) => price.currency.toUpperCase() === selectedCurrency && price.billing_period === period.value),
					);
				})
			: allPeriodOptions;

		// Set default selections if not already set
		// Choose the combination that yields the most plans
		if (!selectedCurrency || !selectedBillingPeriod) {
			let maxPlans = 0;
			let bestCurrency = '';
			let bestPeriod = '';

			// Try each combination to find the one with most plans
			for (const currency of availableCurrencyOptions) {
				for (const period of availablePeriodOptions) {
					const testFiltered = plans
						.map((plan) => ({
							...plan,
							prices: plan.prices?.filter(
								(price) => price.currency.toUpperCase() === currency.value && price.billing_period === period.value,
							),
						}))
						.filter((plan) => plan.prices && plan.prices.length > 0);

					if (testFiltered.length > maxPlans) {
						maxPlans = testFiltered.length;
						bestCurrency = currency.value;
						bestPeriod = period.value;
					}
				}
			}

			// Set the best combination found
			if (maxPlans > 0) {
				if (!selectedCurrency) {
					setSelectedCurrency(bestCurrency);
				}
				if (!selectedBillingPeriod) {
					setSelectedBillingPeriod(bestPeriod);
				}
			}
		}

		// Filter plans based on selected currency and billing period
		const filtered = plans
			.map((plan) => ({
				...plan,
				prices: plan.prices?.filter(
					(price) => price.currency.toUpperCase() === selectedCurrency && price.billing_period === selectedBillingPeriod,
				),
			}))
			.filter((plan) => plan.prices && plan.prices.length > 0);

		return {
			uniqueCurrencies: availableCurrencyOptions,
			uniqueBillingPeriods: availablePeriodOptions,
			filteredPlans: filtered,
		};
	}, [plansData, selectedBillingPeriod, selectedCurrency]);

	const transformedPlans: PricingCardProps[] = filteredPlans.map((plan) => {
		const price = plan.prices?.[0];
		return {
			id: plan.id,
			name: plan.name,
			description: plan.description,
			price: {
				amount: price?.amount,
				currency: price?.currency,
				billingPeriod: price?.billing_period,
			},
			entitlements:
				plan.entitlements?.map((e) => ({
					id: e.id,
					name: e.feature?.name || '',
					type: e.feature_type.toUpperCase() as 'STATIC' | 'BOOLEAN' | 'METERED',
					value:
						e.feature_type === 'boolean'
							? e.is_enabled
							: e.feature_type === 'metered'
								? e.usage_limit || 'Unlimited'
								: e.static_value || '',
					description: e.feature?.description,
					usage_reset_period: e.usage_reset_period || '',
				})) || [],
		};
	});

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching plans');
		return null;
	}

	return (
		<Page headingClassName='items-center' heading='Pricing Plans'>
			{/* filters */}
			<div className='w-full flex justify-end gap-4 mb-8'>
				<Select
					className='w-40'
					value={selectedBillingPeriod}
					options={uniqueBillingPeriods}
					onChange={setSelectedBillingPeriod}
					label='Billing Period'
					placeholder='Select billing period'
				/>
				<Select
					className='w-40'
					value={selectedCurrency}
					options={uniqueCurrencies}
					onChange={setSelectedCurrency}
					label='Currency'
					placeholder='Select currency'
				/>
			</div>

			<div className='flex flex-col'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					<div className='contents'>
						{transformedPlans.map((plan, index) => (
							<div className='w-full flex' key={index}>
								<PricingCard {...plan} className='w-full' />
							</div>
						))}
					</div>
					{/* Add empty divs to maintain grid layout when less than 3 items */}
					{transformedPlans.length === 2 && <div className='hidden lg:block' />}
					{transformedPlans.length === 1 && (
						<>
							<div className='hidden md:block' />
							<div className='hidden lg:block' />
						</>
					)}
				</div>
			</div>
		</Page>
	);
};

export default PricingPlansView;
