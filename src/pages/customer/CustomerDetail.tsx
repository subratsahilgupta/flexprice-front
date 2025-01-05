'use client';

import { Select, DatePicker, Button } from '@/components/atoms';
import CustomerCard from '@/components/molecules/Customer/CustomerCard';
import Preview from '@/components/organisms/Subscription/Preview';
import ChargeTable from '@/components/organisms/Subscription/PriceTable';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { NormalizedPlan, normalizePlan } from '@/utils/models/transformed_plan';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const fetchPlans = async () => {
	const plans = await PlanApi.getAllPlans();
	return plans.plans.map((plan) => ({
		label: plan.name,
		value: plan.id,
	}));
};

const CustomerDetail = () => {
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [prices, setPrices] = useState<NormalizedPlan | null>(null);
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

	// Fetch prices for the selected plan
	const fetchNormalizedPlan = async (planId: string) => {
		const plan = await PlanApi.getPlanById(planId);
		const normalizedPlan = normalizePlan(plan!);
		console.log('normalizedPlan', normalizedPlan);
		const firstBillingPeriod = Object.keys(normalizedPlan.charges)[0];
		setBillingPeriod(firstBillingPeriod);
		setPrices(normalizedPlan);
	};

	return (
		<div className='max-w-7xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-8'>
			{/* Header Section */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold text-gray-800'>Add Subscription</h1>
				<p className='text-gray-600 text-sm'>Make changes to your account here. Click save when you're done.</p>
			</div>

			{/* Main Content */}
			<div className='flex gap-8'>
				{/* Left Section (70%) */}
				<div className='flex-[7] space-y-6'>
					<CustomerCard />

					<div className='p-6 rounded-xl border border-gray-300 space-y-6'>
						<div>
							<h1 className='text-2xl font-bold mb-6 text-gray-800'>Subscription Details</h1>
							<p className='text-gray-600'>Assign a name to your event schema to easily identify and track events processed.</p>
						</div>

						{/* Select Plan Dropdown */}
						{!plansLoading && (
							<Select
								selectedValue={selectedPlan ?? ''}
								options={plans ?? []}
								onChange={(value) => {
									setSelectedPlan(value);
									fetchNormalizedPlan(value);
								}}
								label='Select Plan'
								placeholder='Select plan'
								error={plansError ? 'Failed to load plans' : undefined}
							/>
						)}

						{/* Select Billing Period Dropdown */}
						{!plansLoading && prices && (
							<Select
								selectedValue={billingPeriod ?? ''}
								options={
									prices.charges
										? Object.keys(prices.charges).map((billingPeriod) => ({
												label: billingPeriod,
												value: billingPeriod,
											}))
										: []
								}
								onChange={(value) => setBillingPeriod(value)}
								label='Select Billing Period'
								placeholder='Select billing period'
							/>
						)}

						{/* Select Currency Dropdown */}
						{!plansLoading && prices && (
							<Select
								selectedValue={currency!}
								options={[
									{ label: 'USD', value: 'usd' },
									{ label: 'INR', value: 'inr' },
								]}
								disabled
								onChange={(value) => setCurrency(value)}
								label='Select Currency'
								placeholder='Select currency'
							/>
						)}
						{prices?.charges[billingPeriod!] && <ChargeTable data={prices.charges[billingPeriod!]} />}
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
						<Button onClick={() => {}} className='bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-primary-dark'>
							{'Cancel'}
						</Button>
						<Button onClick={() => {}} className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark'>
							{'Add Subscription'}
						</Button>
					</div>
				</div>

				{/* Right Section (30%) */}
				<div className='flex-[3]'>
					<Preview />
				</div>
			</div>
		</div>
	);
};

export default CustomerDetail;
