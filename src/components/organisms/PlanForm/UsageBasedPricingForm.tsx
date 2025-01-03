import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BsPlusCircle } from 'react-icons/bs';
import { RiDeleteBin6Line } from 'react-icons/ri';

const UsageBasedPricingForm = () => {
	// const { setMetaDataField, setPlanField } = usePlanStore();

	const currencyOptions = [
		{ label: 'USD', value: 'USD', currency: '$' },
		{ label: 'INR', value: 'INR', currency: '₹' },
	];

	const billingModels = [
		{
			value: 'Flat Fee',
			label: 'Flat Fee',
		},
		{
			value: 'Package',
			label: 'Package',
		},
		{
			value: 'Tiered',
			label: 'Tiered',
		},
	];

	const mapCurrency = (currency: string) => {
		const selectedCurrency = currencyOptions.find((option) => option.value === currency);
		return selectedCurrency?.currency;
	};

	const [currency, setcurrency] = useState(currencyOptions[0].value);
	const [billingModel, setbillingModel] = useState(billingModels[0].value);

	const [tieredPrices, settieredPrices] = useState<{ from: number; to: number; per_unit: number; flat_fee: number }[]>([
		{ from: 0, to: 0, per_unit: 0, flat_fee: 0 },
	]);

	const addTieredPrice = () => {
		settieredPrices([...tieredPrices, { from: 0, to: 0, per_unit: 0, flat_fee: 0 }]);
	};

	const removeTier = (index: number) => {
		settieredPrices((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div>
			<div>
				<FormHeader title='Set Usage Based Charge' variant='sub-header' />
				<Select
					selectedValue={mapCurrency(currency)}
					options={currencyOptions}
					label='Select Currency'
					onChange={setcurrency}
					placeholder='Select Currency'
				/>
				<Spacer height={'8px'} />
				<Select
					selectedValue={billingModel}
					options={billingModels}
					onChange={(value) => {
						setbillingModel(value);
					}}
					label='Billing Model'
					placeholder='Select The Billing Period'
				/>
				<Spacer height={'8px'} />

				{/* ui according to the billing models */}
				{billingModel === billingModels[0].value && (
					<div className='space-y-2'>
						<Input
							type='number'
							label='Set Default Price for all plans'
							prefix={currency}
							suffix={<span className='text-[#64748B]'>per month</span>}
						/>
						<button className='p-4 h-9 cursor-pointer flex gap-2 items-center  bg-[#F4F4F5] rounded-md '>
							<BsPlusCircle className='size-3  font-semibold' />
							<p className='text-[#18181B] font-medium '>Add Price for Filters</p>
						</button>
					</div>
				)}
				{billingModel === billingModels[1].value && (
					<div className='space-y-4'>
						<div className='flex w-full gap-2  items-end'>
							<Input type='number' label='Set Default Price for all plans' prefix={currency} />
							<div className='h-[50px] items-center flex gap-2'>
								<p className='text-[#18181B] font-medium'>per</p>
							</div>
							<Input type='number' suffix={<span className='text-[#64748B]'>per month</span>} />
						</div>
						<button className='p-4 h-9 cursor-pointer flex gap-2 items-center  bg-[#F4F4F5] rounded-md '>
							<BsPlusCircle className='size-3  font-semibold' />
							<p className='text-[#18181B] font-medium '>Add Price for Filters</p>
						</button>
					</div>
				)}

				{billingModel === billingModels[2].value && (
					<div className='space-y-4'>
						<Spacer height={'16px'} />
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
										<tr key={index} className=''>
											<td className=' px-4 py-2'>
												<Input
													className='h-9'
													onChange={(e) => {
														const value = Number(e);
														settieredPrices((prev) => {
															const updatedTiers = prev.map((tier, i) => {
																if (i === index) {
																	return { ...tier, from: value };
																}
																return tier;
															});
															return updatedTiers;
														});
													}}
													type='number'
													value={tier.from}
													placeholder='Placeholder'
												/>
											</td>
											<td className=' px-4 py-2'>
												<Input
													className='h-9'
													type='number'
													onChange={(e) => {
														const value = Number(e);
														settieredPrices((prev) => {
															const updatedTiers = prev.map((tier, i) => {
																if (i === index) {
																	return { ...tier, to: value };
																}
																return tier;
															});
															return updatedTiers;
														});
													}}
													value={tier.to}
													placeholder='Placeholder'
												/>
											</td>
											<td className=' px-4 py-2'>
												<Input
													className='h-9'
													onChange={(e) => {
														const value = Number(e);
														settieredPrices((prev) => {
															const updatedTiers = prev.map((tier, i) => {
																if (i === index) {
																	return { ...tier, per_unit: value };
																}
																return tier;
															});
															return updatedTiers;
														});
													}}
													type='number'
													value={tier.per_unit}
													placeholder='Rs. 100'
												/>
											</td>
											<td className=' px-4 py-2'>
												<Input
													className='h-9'
													onChange={(e) => {
														const value = Number(e);
														settieredPrices((prev) => {
															const updatedTiers = prev.map((tier, i) => {
																if (i === index) {
																	return { ...tier, flat_fee: value };
																}
																return tier;
															});
															return updatedTiers;
														});
													}}
													type='number'
													value={tier.flat_fee}
													placeholder='Placeholder'
												/>
											</td>
											<td className=' px-4 py-2 text-center'>
												<button
													className='flex justify-center items-center size-9 rounded-md border text-zinc'
													onClick={() => {
														removeTier(index);
													}}>
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
			</div>
		</div>
	);
};

export default UsageBasedPricingForm;
