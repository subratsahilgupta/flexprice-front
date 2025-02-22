import usePlanStore, { Price } from '@/store/usePlanStore';
import { FC, useState } from 'react';
import { subscriptionTypeOptions } from './SetupChargesSection';
import { Button, Input, Select, Spacer } from '@/components/atoms';
import SelectMeter from './SelectMeter';
import { Pencil, Trash2 } from 'lucide-react';
import { Meter } from '@/models/Meter';
import { formatBillingPeriod, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { currencyOptions } from '@/core/data/constants';
import VolumeTieredPricingForm from './VolumeTieredPricingForm';
import { formatAmountWithCommas } from '@/components/atoms/Input/Input';
import { removeCommasFromAmount } from '@/components/atoms/Input/Input';

interface Props {
	data?: Partial<Price>;
	isEdit?: boolean;
	handleEdit?: () => void;
	handleDelete?: () => void;
	addPrice?: (data: Partial<Price>) => void;
	label?: string;
}

export interface PriceTier {
	from: number;
	up_to: number | null;
	flat_amount?: string;
	unit_amount?: string;
}

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

const UsagePricingForm: FC<Props> = ({ data, isEdit, handleDelete, handleEdit, addPrice, label }) => {
	const metaData = usePlanStore((state) => state.metaData);

	const [currency, setCurrency] = useState(metaData?.usageBasedPrice?.currency || data?.currency || currencyOptions[0].value);
	const [billingModel, setBillingModel] = useState(
		metaData?.usageBasedPrice?.billing_model || data?.billing_model || billingModels[0].value,
	);
	const [meterId, setMeterId] = useState(metaData?.usageBasedPrice?.meter_id || data?.meter_id);

	const [tieredPrices, setTieredPrices] = useState<PriceTier[]>(
		data?.tiers?.map((tier: any) => ({
			from: tier.from,
			up_to: tier.up_to,
			flat_amount: tier.flat_amount,
			unit_amount: tier.unit_amount,
		})) || [
			{ from: 1, up_to: 1 },
			{ from: 2, up_to: null },
		],
	);
	const [billingPeriod, setbillingPeriod] = useState(data?.billing_period || billlingPeriodOptions[2].value);
	const [flatFee, setflatFee] = useState<string>(data?.amount || '');
	const [packagedFee, setpackagedFee] = useState<{ unit: string; price: string }>({
		unit: data?.transform_quantity?.divide_by ? `${data?.transform_quantity?.divide_by}` : '',
		price: data?.amount || '',
	});
	const [errors, seterrors] = useState<Partial<Record<keyof Price, any>>>({});
	const [inputErrors, setinputErrors] = useState({
		flatModelError: '',
		packagedModelError: '',
		tieredModelError: '',
	});

	const [activeMeter, setactiveMeter] = useState<Meter | null>();

	// Remove a tier

	// Update a tier value

	// Handle saving of pricing information
	const handleAddPrice = () => {
		if (!validate()) {
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
			for (let i = 0; i < tieredPrices.length; i++) {
				if (!tieredPrices[i].up_to && i !== tieredPrices.length - 1) {
					tieredPrices[i].up_to = tieredPrices[i + 1].up_to ? tieredPrices[i + 1].up_to! - 1 : null;
				}
			}
			data.tiers = tieredPrices.map((tier) => ({
				from: tier.from,
				up_to: tier.up_to,
				unit_amount: tier.unit_amount || '0',
				flat_amount: tier.flat_amount || '0',
			})) as any;
			data.tier_mode = 'VOLUME';
		}

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

		if (!meterId) {
			seterrors((prev) => ({ ...prev, meter_id: 'Meter is required' }));
			return false;
		}

		if (billingModel === billingModels[2].value) {
			tieredPrices.map((tier, index) => {
				if (tier.from > (tier.up_to !== null ? tier.up_to : 999999)) {
					setinputErrors((prev) => ({ ...prev, tieredModelError: `From value cannot be small than upto in row ${index + 1}` }));
					return true;
				}

				// if (tier.unit_amount < 0 || tier.flat_amount < 0) {
				// 	setinputErrors((prev) => ({ ...prev, tieredModelError: `Units and Flat amount cannot be nagative in row ${index + 1}` }));
				// 	return true;
				// }
			});
		}

		if (billingModel === billingModels[1].value) {
			if (packagedFee.price === '' || packagedFee.unit === '') {
				setinputErrors((prev) => ({ ...prev, packagedModelError: 'Invalid package fee' }));
				return false;
			}
		}

		if (billingModel === billingModels[0].value) {
			if (!flatFee || Number(flatFee) < 0) {
				setinputErrors((prev) => ({ ...prev, flatModelError: 'Invalid flat fee' }));
				return false;
			}
		}

		return true;
	};

	console.log('data', data);

	if (!isEdit) {
		return (
			<div className='mb-2'>
				{/* Edit/Delete CTA */}
				<div
					className='gap-2 w-full flex justify-between group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:opacity-50 md:text-sm disabled:cursor-not-allowed cursor-pointer'
					onClick={handleEdit}>
					<div>
						<p>{activeMeter ? `${activeMeter.name}` : `Usage Based Charge ${label}`}</p>
						<span className='flex gap-2'>
							<p className='text-zinc-500 text-xs'>
								{data?.currency} | {toSentenceCase(data?.billing_period || '')}
							</p>
						</span>
					</div>
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
		<div className='card mb-2'>
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
						placeholder='0'
						type='number'
						error={inputErrors.flatModelError}
						label='Price'
						value={formatAmountWithCommas(flatFee)}
						inputPrefix={getCurrencySymbol(currency)}
						onChange={(e) => {
							setflatFee(removeCommasFromAmount(e));
						}}
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
							placeholder='0'
							value={packagedFee.price}
							inputPrefix={getCurrencySymbol(currency)}
							onChange={(e) => setpackagedFee({ ...packagedFee, price: e })}
						/>
						<div className='h-[50px] items-center flex gap-2'>
							<p className='text-[#18181B] font-medium'>per</p>
						</div>
						<Input
							value={formatAmountWithCommas(packagedFee.unit)}
							type='text'
							placeholder='0'
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
				<VolumeTieredPricingForm setTieredPrices={setTieredPrices} tieredPrices={tieredPrices} currency={currency} />
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
