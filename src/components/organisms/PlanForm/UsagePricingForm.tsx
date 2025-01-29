import usePlanStore, { Price } from '@/store/usePlanStore';
import { FC, useState } from 'react';
import { subscriptionTypeOptions } from './SetupChargesSection';
import { Button, Input, Select, Spacer } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SelectMeter from './SelectMeter';
import { Pencil, Trash2 } from 'lucide-react';
import { Meter } from '@/models/Meter';
import { formatBillingPeriod } from '@/utils/common/helper_functions';

const formatAmountWithCommas = (amount: string): string => {
	return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const removeCommasFromAmount = (amount: string): string => {
	return amount.replace(/,/g, '');
};

interface Props {
	data?: Partial<Price>;
	isEdit?: boolean;
	handleEdit?: () => void;
	handleDelete?: () => void;
	addPrice?: (data: Partial<Price>) => void;
	label?: string;
}

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
	{ value: 'FLAT_FEE', label: 'Flat Fee' },
	{ value: 'PACKAGE', label: 'Package' },
	{ value: 'TIERED', label: 'Volume Tiered' },
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

const UsagePricingForm: FC<Props> = ({ data, isEdit, handleDelete, handleEdit, addPrice, label }) => {
	const metaData = usePlanStore((state) => state.metaData);

	const [currency, setCurrency] = useState(metaData?.usageBasedPrice?.currency || currencyOptions[0].value);
	const [billingModel, setBillingModel] = useState(metaData?.usageBasedPrice?.billing_model || billingModels[0].value);
	const [meterId, setMeterId] = useState(metaData?.usageBasedPrice?.meter_id);

	const [tieredPrices, setTieredPrices] = useState<PriceTier[]>([
		{ from: 1, up_to: 1, unit_amount: 0, flat_amount: 0 },
		{ from: 2, up_to: null, unit_amount: 0, flat_amount: 0 },
	]);
	const [billingPeriod, setbillingPeriod] = useState(data?.billing_period || billlingPeriodOptions[2].value);
	const [flatFee, setflatFee] = useState<string>(data?.amount || '');
	const [packagedFee, setpackagedFee] = useState<{ unit: string; price: string }>({ unit: '', price: '' });
	const [errors, seterrors] = useState<Partial<Record<keyof Price, any>>>({});
	const [inputErrors, setinputErrors] = useState({
		flatModelError: '',
		packagedModelError: '',
		tieredModelError: '',
	});

	const [activeMeter, setactiveMeter] = useState<Meter | null>();
	const addTieredPrice = () => {
		setTieredPrices((prev) => {
			const lastTier = prev[prev.length - 1];
			console.log('lastTier', lastTier);

			if (lastTier.up_to === null) {
				prev[prev.length - 1] = { ...lastTier, up_to: lastTier.from + 1 };
			}
			const newFrom = lastTier.up_to ?? lastTier.from + 1;
			console.log('new from ', newFrom);

			const newTier = { from: newFrom + 1, up_to: null, unit_amount: 0, flat_amount: 0 };
			return [...prev, newTier];
		});
	};

	// Remove a tier
	const removeTier = (index: number) => {
		if (index === 0 && tieredPrices.length === 1) {
			return;
		}
		setTieredPrices((prev) => {
			const updatedTiers = prev.filter((_, i) => i !== index);
			if (updatedTiers.length > 0 && index === prev.length - 1) {
				updatedTiers[updatedTiers.length - 1].up_to = null;
			}
			return updatedTiers;
		});
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
			type: subscriptionTypeOptions[1].value,
		};

		if (billingModel === billingModels[0].value) {
			data.amount = flatFee;
		}

		if (billingModel === billingModels[1].value) {
			data.amount = packagedFee.price;
			data.transform_quantity = {
				divide_by: Number(packagedFee.unit),
			};
		}

		if (billingModel === billingModels[2].value) {
			data.tiers = tieredPrices.map((tier) => ({
				up_to: tier.up_to!,
				unit_amount: tier.unit_amount.toString(),
				flat_amount: tier.flat_amount.toString(),
			}));
			data.tier_mode = 'VOLUME';
		}

		console.log('data', data);
		if (addPrice) {
			addPrice(data);
		}

		// setMetaDataField('usageBasedPrice', data);
		// setMetaDataField('isUsageEditMode', false);
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
			tieredPrices.map((tier, index) => {
				if (tier.from > (tier.up_to !== null ? tier.up_to : 999999)) {
					setinputErrors((prev) => ({ ...prev, tieredModelError: `From value cannot be small than upto in row ${index + 1}` }));
					return true;
				}

				if (tier.unit_amount < 0 || tier.flat_amount < 0) {
					setinputErrors((prev) => ({ ...prev, tieredModelError: `Units and Flat amount cannot be nagative in row ${index + 1}` }));
					return true;
				}
			});
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

	if (!isEdit) {
		return (
			<div className='mb-2'>
				{/* Edit/Delete CTA */}
				<div
					className='gap-2 w-full flex justify-between group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:opacity-50 md:text-sm disabled:cursor-not-allowed cursor-pointer'
					onClick={handleEdit}>
					<p>{activeMeter ? `${activeMeter.name}` : `Usage Based Charge ${label}`}</p>
					<span className='text-[#18181B] flex gap-2 items-center'>
						<button onClick={handleEdit}>
							<Pencil size={16} />
						</button>
						<div className='border-r h-[16px] border-[#E4E4E7]' />
						<button onClick={handleDelete}>
							<Trash2 size={16} />
						</button>
					</span>
				</div>
			</div>
		);
	}

	return (
		<div>
			<Spacer height={'8px'} />
			<SelectMeter
				error={errors.meter_id}
				onChange={(meter) => {
					setMeterId(meter.id);
					setactiveMeter(meter);
				}}
				value={meterId}
			/>
			<Spacer height='8px' />
			<Select
				value={currency}
				options={currencyOptions}
				label='Currency'
				onChange={setCurrency}
				placeholder='Currency'
				error={errors.currency}
			/>
			<Spacer height='8px' />
			<Select
				value={billingPeriod}
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
				value={billingModel}
				options={billingModels}
				onChange={setBillingModel}
				label='Billing Model'
				error={errors.billing_model}
				placeholder='Billing Model'
			/>
			<Spacer height='8px' />

			{/* UI according to the billing models */}
			{billingModel === billingModels[0].value && (
				<div className='space-y-2'>
					<Input
						type='number'
						error={inputErrors.flatModelError}
						label='Price'
						inputPrefix={mapCurrency(currency)}
						onChange={(e) => setflatFee(e)}
						suffix={<span className='text-[#64748B]'>{`/ unit / ${formatBillingPeriod(billingPeriod)}`}</span>}
					/>
				</div>
			)}

			{billingModel === billingModels[1].value && (
				<div className='space-y-1'>
					<div className='flex w-full gap-2 items-end'>
						<Input
							type='number'
							label='Price'
							value={packagedFee.price}
							inputPrefix={mapCurrency(currency)}
							onChange={(e) => setpackagedFee({ ...packagedFee, price: e })}
						/>
						<div className='h-[50px] items-center flex gap-2'>
							<p className='text-[#18181B] font-medium'>per</p>
						</div>
						<Input
							value={formatAmountWithCommas(packagedFee.unit)}
							type='text'
							onChange={(e) =>
								setpackagedFee({
									...packagedFee,
									unit: removeCommasFromAmount(e),
								})
							}
							suffix={`/ units / ${formatBillingPeriod(billingPeriod)}`}
						/>
					</div>
					{inputErrors.packagedModelError && <p className='text-red-500 text-sm'>{inputErrors.packagedModelError}</p>}
				</div>
			)}

			{billingModel === billingModels[2].value && (
				<div className='space-y-4'>
					<Spacer height='16px' />
					<div className={cn('w-full', tieredPrices.length > 0 ? '' : 'hidden')}>
						<table className='table-auto w-full border-collapse border border-gray-200 overflow-x-auto'>
							<thead>
								<tr className='bg-gray-100 text-left border-b'>
									<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>First unit</th>
									<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>Last unit</th>
									<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>{`Per unit price `}</th>
									<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'>Flat fee </th>
									<th className='px-4 py-2 font-normal bg-white text-nowrap text-[#71717A]'></th>
								</tr>
							</thead>
							<tbody>
								{tieredPrices.map((tier, index) => (
									<tr key={index} className='w-full'>
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
												disabled={tier.up_to === null}
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
				<Button onClick={handleDelete} variant='secondary' className='mr-4 text-zinc-900'>
					Cancel
				</Button>
				<Button onClick={handleAddPrice} variant='default' className='mr-4 font-normal'>
					Add
				</Button>
			</div>
		</div>
	);
};

export default UsagePricingForm;
