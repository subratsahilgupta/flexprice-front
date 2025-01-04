import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RiDeleteBin6Line } from 'react-icons/ri';
import usePlanStore, { Price } from '@/store/usePlanStore';
import SelectMeter from './SelectMeter';

interface PriceTier {
	from: number;
	flat_amount: number;
	unit_amount: number;
	up_to: number | null;
}

const currencyOptions = [
	{ label: 'USD', value: 'USD', currency: '$' },
	{ label: 'INR', value: 'INR', currency: '₹' },
];

const billingModels = [
	{ value: 'Flat Fee', label: 'Flat Fee' },
	{ value: 'Package', label: 'Package' },
	{ value: 'Tiered', label: 'Tiered' },
];

const billlingPeriodOptions = [
	{ label: 'Daily', value: 'DAILY' },
	{ label: 'Weekly', value: 'WEEKLY' },
	{ label: 'Monthly', value: 'MONTHLY' },
	{ label: 'Yearly', value: 'ANNUAL' },
];

const mapCurrency = (currency: string) => {
	const selectedCurrency = currencyOptions.find((option) => option.value === currency);
	return selectedCurrency?.currency || '';
};

const UsageBasedPricingForm = () => {
	const { setMetaDataField } = usePlanStore();
	const metaData = usePlanStore((state) => state.metaData);
	const usageBasedPrice = usePlanStore((state) => state.metaData?.usageBasedPrice);

	const [currency, setCurrency] = useState(metaData?.usageBasedPrice?.currency || currencyOptions[0].value);
	const [billingModel, setBillingModel] = useState(metaData?.usageBasedPrice?.billing_model || billingModels[0].value);
	const [meterId, setMeterId] = useState(metaData?.usageBasedPrice?.meter_id);

	const [tieredPrices, setTieredPrices] = useState<PriceTier[]>([{ from: 0, up_to: null, unit_amount: 0, flat_amount: 0 }]);
	const [billingPeriod, setbillingPeriod] = useState(usageBasedPrice?.billing_period || billlingPeriodOptions[0].value);
	const [flatFee, setflatFee] = useState<string>(usageBasedPrice?.amount || '');
	const [packagedFee, setpackagedFee] = useState<{ unit: string; price: string }>({ unit: '', price: '' });
	const [errors, seterrors] = useState<Partial<Record<keyof Price, any>>>({});
	const [inputErrors, setinputErrors] = useState({
		flatModelError: '',
		packagedModelError: '',
		tieredModelError: '',
	});

	// Add a new tier
	const addTieredPrice = () => {
		setTieredPrices((prev) => {
			const lastTier = prev[prev.length - 1];
			const newFrom = lastTier.up_to ?? 0 + 1;
			const newTier = { from: newFrom, up_to: null, unit_amount: 0, flat_amount: 0 };
			return [...prev, newTier];
		});
	};

	// Remove a tier
	const removeTier = (index: number) => {
		if (index === 0 && tieredPrices.length === 1) {
			return;
		}
		setTieredPrices((prev) => prev.filter((_, i) => i !== index));
	};

	// Update a tier value
	const updateTier = (index: number, key: string, value: number) => {
		setTieredPrices((prev) => {
			const updatedTiers = [...prev];
			updatedTiers[index] = { ...updatedTiers[index], [key]: value };

			// Adjust the 'from' and 'up_to' values based on the tier being updated
			if (key === 'up_to' && index < prev.length - 1) {
				// If 'up_to' is updated, adjust the 'from' value of the next tier
				const nextTier = updatedTiers[index + 1];
				nextTier.from = value + 1;
			}

			if (key === 'from' && index > 0) {
				// If 'from' is updated, adjust the 'up_to' value of the previous tier
				const previousTier = updatedTiers[index - 1];
				previousTier.up_to = value - 1;
			}

			return updatedTiers;
		});
	};

	// Handle saving of pricing information
	const handleAddPrice = () => {
		if (!validate()) {
			console.log('Validation failed');
			return;
		}

		const data: Price = {
			// amount: flatFee,
			meter_id: meterId,
			currency,
			billing_period: billingPeriod,
			billing_model: billingModel,
			type: metaData?.subscriptionType,
		};

		if (billingModel === billingModels[0].value) {
			data.amount = flatFee;
		}

		if (billingModel === billingModels[1].value) {
			data.tiers = [
				{
					flat_amount: packagedFee.price,
					unit_amount: packagedFee.unit,
				},
			];
		}

		if (billingModel === billingModels[2].value) {
			data.tiers = tieredPrices.map((tier) => ({
				up_to: tier.up_to?.toString(),
				unit_amount: tier.unit_amount.toString(),
				flat_amount: tier.flat_amount.toString(),
			}));
		}

		console.log('data', data);

		setMetaDataField('usageBasedPrice', data);
		setMetaDataField('isUsageEditMode', false);
	};

	const validate = () => {
		seterrors({});
		setinputErrors({
			flatModelError: '',
			packagedModelError: '',
			tieredModelError: '',
		});

		console.log('inside validate function');

		if (!meterId) {
			seterrors((prev) => ({ ...prev, meter_id: 'Meter is required' }));
			console.log('validation failed Meter is required');
			return false;
		}

		if (billingModel === billingModels[2].value) {
			const invalidTier = tieredPrices.find((tier) => {
				return tier.from > (tier.up_to ?? 0) || tier.unit_amount < 0 || tier.flat_amount < 0;
			});
			if (invalidTier) {
				setinputErrors((prev) => ({ ...prev, tieredModelError: 'Invalid tiered price' }));
				console.log('validation failed Invalid tiered price');

				return false;
			}
		}

		if (billingModel === billingModels[1].value) {
			if (packagedFee.price === '' || packagedFee.unit === '') {
				setinputErrors((prev) => ({ ...prev, packagedModelError: 'Invalid package fee' }));
				console.log('validation failed Invalid package fee');
				return false;
			}
		}

		if (billingModel === billingModels[0].value) {
			if (!flatFee || Number(flatFee) < 0) {
				setinputErrors((prev) => ({ ...prev, flatModelError: 'Invalid flat fee' }));
				console.log('validation failed Invalid flat fee');
				return false;
			}
		}

		return true;
	};

	return (
		<div>
			{metaData?.isUsageEditMode && (
				<div>
					<FormHeader title='Set Usage Based Charge' variant='sub-header' />

					<SelectMeter error={errors.meter_id} onChange={setMeterId} value={meterId} />
					<Spacer height='8px' />
					<Select
						selectedValue={currency}
						options={currencyOptions}
						label='Select Currency'
						onChange={setCurrency}
						placeholder='Select Currency'
						error={errors.currency}
					/>
					<Spacer height='8px' />
					<Select
						selectedValue={billingPeriod}
						options={billlingPeriodOptions}
						onChange={(value) => {
							setbillingPeriod(value);
						}}
						label='Billing Period'
						placeholder='Select The Billing Period'
						error={errors.billing_period}
					/>
					<Spacer height={'8px'} />

					<Select
						selectedValue={billingModel}
						options={billingModels}
						onChange={setBillingModel}
						label='Billing Model'
						error={errors.billing_model}
						placeholder='Select The Billing Model'
					/>
					<Spacer height='8px' />

					{/* UI according to the billing models */}
					{billingModel === billingModels[0].value && (
						<div className='space-y-2'>
							<Input
								type='number'
								error={inputErrors.flatModelError}
								label='Set Default Price for all plans'
								inputPrefix={mapCurrency(currency)}
								onChange={(e) => setflatFee(e)}
								suffix={<span className='text-[#64748B]'>per unit</span>}
							/>
						</div>
					)}

					{billingModel === billingModels[1].value && (
						<div className='space-y-1'>
							<div className='flex w-full gap-2 items-end'>
								<Input
									type='number'
									label='Set Default Price for all plans'
									inputPrefix={currency}
									onChange={(e) => setpackagedFee({ ...packagedFee, price: e })}
								/>
								<div className='h-[50px] items-center flex gap-2'>
									<p className='text-[#18181B] font-medium'>per</p>
								</div>
								<Input
									type='number'
									onChange={(e) =>
										setpackagedFee({
											...packagedFee,
											unit: e,
										})
									}
									suffix={<span className='text-[#64748B]'>per month</span>}
								/>
							</div>
							{inputErrors.packagedModelError && <p className='text-red-500 text-sm'>{inputErrors.packagedModelError}</p>}
						</div>
					)}

					{billingModel === billingModels[2].value && (
						<div className='space-y-4'>
							<Spacer height='16px' />
							<div className={cn('w-full', tieredPrices.length > 0 ? '' : 'hidden')}>
								<table className='table-auto w-full border-collapse border border-gray-200'>
									<thead>
										<tr className='bg-gray-100 text-left border-b'>
											<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>From (units)</th>
											<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>To (units)</th>
											<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>Per Unit (Monthly)</th>
											<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>Flat Fee (Monthly)</th>
											<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'></th>
										</tr>
									</thead>
									<tbody>
										{tieredPrices.map((tier, index) => (
											<tr key={index}>
												<td className='px-4 py-2'>
													<Input
														disabled
														className='h-9'
														onChange={(e) => updateTier(index, 'from', Number(e))}
														type='number'
														value={tier.from}
														placeholder='From'
													/>
												</td>
												<td className='px-4 py-2'>
													<Input
														className='h-9'
														onChange={(e) => updateTier(index, 'up_to', Number(e))}
														// type='number'
														value={tier.up_to === null ? '∞' : tier.up_to}
														placeholder='To (Infinity)'
													/>
												</td>
												<td className='px-4 py-2'>
													<Input
														className='h-9'
														onChange={(e) => updateTier(index, 'unit_amount', Number(e))}
														type='number'
														value={tier.unit_amount}
														placeholder='Rs. 100'
													/>
												</td>
												<td className='px-4 py-2'>
													<Input
														className='h-9'
														onChange={(e) => updateTier(index, 'flat_amount', Number(e))}
														type='number'
														value={tier.flat_amount}
														placeholder='Flat Fee'
													/>
												</td>
												<td className='px-4 py-2 text-center'>
													<button
														className='flex justify-center items-center size-9 rounded-md border text-zinc'
														onClick={() => removeTier(index)}>
														<RiDeleteBin6Line className='text-zinc' />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className='flex justify-between items-center mt-4'>
								<Button onClick={addTieredPrice} variant='default' className='flex items-center gap-2'>
									Add Tier
								</Button>
							</div>
						</div>
					)}

					<Spacer height='16px' />
					<div className='flex justify-end'>
						<Button variant='secondary' className='mr-4 text-zinc-900'>
							Cancel
						</Button>
						<Button onClick={handleAddPrice} variant='default' className='mr-4 font-normal'>
							Add
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default UsageBasedPricingForm;
