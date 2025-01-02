import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import { IoRepeat } from 'react-icons/io5';
import { FiDatabase } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { SlPencil } from 'react-icons/sl';
import { MdOutlineDelete } from 'react-icons/md';
import { BsPlusCircle } from 'react-icons/bs';
import { RiDeleteBin6Line } from 'react-icons/ri';

const SetupChargesSection = () => {
	const currencyOptions = [
		{ label: 'USD', value: 'USD', currency: '$' },
		{ label: 'INR', value: 'INR', currency: '₹' },
	];
	const subscriptionTypes = [
		{
			value: 'recurring',
			label: 'Recurring',
			icon: IoRepeat,
		},
		{
			value: 'usage_based',
			label: 'Usage Based',
			icon: FiDatabase,
		},
	];

	const [usageBasedPrice, setusageBasedPrice] = useState<{
		billingModel: string;
		value: number;
		currency: string;
	}>();

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

	const [subscriptionType, setsubscriptionType] = useState<string>();
	const [currency, setcurrency] = useState(currencyOptions[0].value);
	const [billingModel, setbillingModel] = useState(billingModels[0].value);
	const [reccuringPrice, setreccuringPrice] = useState<{
		currency: string;
		period: string;
		value: number;
	}>();

	const handleAddRecurringPrice = () => {
		setreccuringPrice({
			currency,
			period: 'monthly',
			value: 0,
		});
		setcurrency(currencyOptions[0].value);
	};

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
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Plan Charges '}
				subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
				variant='sub-header'
			/>
			{!reccuringPrice && (
				<div className=''>
					<FormHeader title={'Select the Subscription Type'} variant='form-component-title' />
					<div className='w-full gap-4 grid grid-cols-2'>
						{subscriptionTypes.map((type) => {
							const isActive = subscriptionType === type.value;
							return (
								<button
									onClick={() => setsubscriptionType(type.value)}
									className={cn(
										'p-3 rounded-md border-2  w-full flex flex-col justify-center items-center',
										isActive ? 'border-[#0F172A]' : 'border-[#E2E8F0]',
									)}>
									{type.icon && <type.icon size={24} className='text-[#020617]' />}
									<p className='text-[#18181B] font-medium mt-2'>{type.label}</p>
								</button>
							);
						})}
					</div>
					<Spacer height={'4px'} />
					<p className=' text-sm text-muted-foreground'>Default subscription means... Subscription means lorem ipsum</p>

					<Spacer height={'16px'} />
					{/* Recurring price ui */}
					{subscriptionType === 'recurring' && (
						<div className=''>
							<FormHeader title='Recurring Fee' variant='form-component-title' />
							<Select
								selectedValue={currency}
								options={currencyOptions}
								label='Select Currency'
								onChange={setcurrency}
								placeholder='Select Currency'
							/>
							<Spacer height={'8px'} />
							<Select
								selectedValue='monthly'
								options={[
									{ label: 'Monthly', value: 'monthly' },
									{ label: 'Yearly', value: 'yearly' },
								]}
								onChange={(value) => {
									console.log('new value in setup', value);
								}}
								label='Billing Period'
								placeholder='Select The Billing Period'
							/>
							<Spacer height={'8px'} />
							<Input type='number' label='Value' prefix={currency} suffix={<span className='text-[#64748B]'>per month</span>} />
							<Spacer height={'16px'} />
							<div className='flex justify-end'>
								<Button variant='secondary' className='mr-4 text-zinc-900 '>
									Cancel
								</Button>
								<Button onClick={handleAddRecurringPrice} variant='default' className='mr-4 font-normal'>
									Add
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			{reccuringPrice && (
				<div>
					<FormHeader title={'Usage Fee(s)'} variant='sub-header' />
					<Input
						value={'Usage Fee'}
						disabled
						suffix={
							<span className='text-[#18181B] flex gap-2 items-center'>
								<button>
									<SlPencil size={16} />
								</button>
								<div className='border-r h-[16px]  border-[#E4E4E7]'></div>
								<button onClick={() => setreccuringPrice(undefined)}>
									<MdOutlineDelete size={20} />
								</button>
							</span>
						}
					/>
					<Spacer height={'16px'} />
					<div className='border-b border-[#F4F4F5] w-full' />
					<Spacer height={'16px'} />
					<div className='flex items-center gap-2'>
						<button className='p-4 h-9 cursor-pointer flex gap-2 items-center  bg-[#F4F4F5] rounded-md '>
							<BsPlusCircle className='size-3  font-semibold' />
							<p className='text-[#18181B] font-medium '>Add Recurring Based Charges</p>
						</button>
						<button
							onClick={() => {
								setusageBasedPrice({
									billingModel: 'Flat Fee',
									value: 0,
									currency: 'USD',
								});
							}}
							className='p-4 h-9 cursor-pointer flex gap-2 items-center  bg-[#F4F4F5] rounded-md '>
							<BsPlusCircle className='size-3  font-semibold' />
							<p className='text-[#18181B] font-medium '>Add Usage Based Charges</p>
						</button>
					</div>
				</div>
			)}
			<Spacer height={'16px'} />
			{usageBasedPrice && (
				<div>
					<FormHeader title='Set Usage Based Charge' variant='sub-header' />
					<Select
						selectedValue={currency}
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
	);
};

export default SetupChargesSection;
