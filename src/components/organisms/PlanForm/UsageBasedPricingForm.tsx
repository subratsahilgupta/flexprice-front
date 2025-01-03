import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RiDeleteBin6Line } from 'react-icons/ri';
import usePlanStore from '@/store/usePlanStore';
import { subscriptionTypeOptions } from './SetupChargesSection';
import SelectMeter from './SelectMeter';

const UsageBasedPricingForm = () => {
	const { setMetaDataField } = usePlanStore();
	const metaData = usePlanStore((state) => state.metaData);

	const currencyOptions = useMemo(
		() => [
			{ label: 'USD', value: 'USD', currency: '$' },
			{ label: 'INR', value: 'INR', currency: '₹' },
		],
		[],
	);

	const billingModels = [
		{ value: 'Flat Fee', label: 'Flat Fee' },
		{ value: 'Package', label: 'Package' },
		{ value: 'Tiered', label: 'Tiered' },
	];

	const [currency, setCurrency] = useState(metaData?.usageBasedPrice?.currency || currencyOptions[0].value);
	const [billingModel, setBillingModel] = useState(metaData?.usageBasedPrice?.billing_model || billingModels[0].value);
	const [meterId, setMeterId] = useState(metaData?.usageBasedPrice?.meter_id);

	const [tieredPrices, setTieredPrices] = useState([{ flat_amount: 0, up_to: 0, unit_amount: 0 }]);

	const mapCurrency = useCallback(
		(currency: string) => {
			const selectedCurrency = currencyOptions.find((option) => option.value === currency);
			return selectedCurrency?.currency || '';
		},
		[currencyOptions],
	);

	const addTieredPrice = () => {
		setTieredPrices((prev) => [...prev, { flat_amount: 0, up_to: 0, unit_amount: 0 }]);
	};

	const removeTier = (index: number) => {
		setTieredPrices((prev) => prev.filter((_, i) => i !== index));
	};

	const updateTier = (index: number, key: string, value: number) => {
		setTieredPrices((prev) => {
			const updatedTiers = [...prev];
			updatedTiers[index] = { ...updatedTiers[index], [key]: value };
			return updatedTiers;
		});
	};

	const handleAddPrice = () => {
		setMetaDataField('usageBasedPrice', { currency, billing_model: billingModel });
		setMetaDataField('isUsageEditMode', false);
	};

	return (
		<div>
			{(metaData?.isUsageEditMode || metaData?.subscriptionType === subscriptionTypeOptions[1].value) && (
				<div>
					<FormHeader title='Set Usage Based Charge' variant='sub-header' />

					<SelectMeter onChange={setMeterId} value={meterId} />
					<Spacer height='8px' />
					<Select
						selectedValue={mapCurrency(currency)}
						options={currencyOptions}
						label='Select Currency'
						onChange={setCurrency}
						placeholder='Select Currency'
					/>
					<Spacer height='8px' />
					<Select
						selectedValue={billingModel}
						options={billingModels}
						onChange={setBillingModel}
						label='Billing Model'
						placeholder='Select The Billing Period'
					/>
					<Spacer height='8px' />

					{/* UI according to the billing models */}
					{billingModel === billingModels[0].value && (
						<div className='space-y-2'>
							<Input
								type='number'
								label='Set Default Price for all plans'
								inputPrefix={currency}
								suffix={<span className='text-[#64748B]'>per month</span>}
							/>
						</div>
					)}

					{billingModel === billingModels[1].value && (
						<div className='space-y-4'>
							<div className='flex w-full gap-2 items-end'>
								<Input type='number' label='Set Default Price for all plans' inputPrefix={currency} />
								<div className='h-[50px] items-center flex gap-2'>
									<p className='text-[#18181B] font-medium'>per</p>
								</div>
								<Input type='number' suffix={<span className='text-[#64748B]'>per month</span>} />
							</div>
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
														className='h-9'
														onChange={(e) => updateTier(index, 'flat_amount', Number(e))}
														type='number'
														value={tier.flat_amount}
														placeholder='Placeholder'
													/>
												</td>
												<td className='px-4 py-2'>
													<Input
														className='h-9'
														onChange={(e) => updateTier(index, 'up_to', Number(e))}
														type='number'
														value={tier.up_to}
														placeholder='Placeholder'
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
														placeholder='Placeholder'
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
