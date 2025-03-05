import { Price } from '@/models/Price';
import { FC, useState, useEffect } from 'react';
import { Button, CheckboxRadioGroup, Input, Select, Spacer } from '@/components/atoms';
import SelectMeter from './SelectMeter';
// import { Pencil, Trash2 } from 'lucide-react';
import { Meter } from '@/models/Meter';
import { formatBillingPeriodForPrice, getCurrencySymbol } from '@/utils/common/helper_functions';
import { billlingPeriodOptions, currencyOptions } from '@/core/data/constants';
import VolumeTieredPricingForm from './VolumeTieredPricingForm';
import { InternalPrice } from './SetupChargesSection';
import UsagePriceItem from './UsagePriceItem';

interface Props {
	onSave: (price: InternalPrice) => void;
	onDelete: (index: number) => void;
	prices: InternalPrice[];
}

export interface PriceTier {
	from: number;
	up_to: number | null;
	flat_amount?: string;
	unit_amount?: string;
}

interface TieredPrice {
	from: number;
	up_to: number | null;
	unit_amount: string;
	flat_amount: string;
}

const billingModels = [
	{ value: 'FLAT_FEE', label: 'Flat Fee' },
	{ value: 'PACKAGE', label: 'Package' },
	{ value: 'TIERED', label: 'Volume Tiered' },
];

const UsagePricingForm: FC<Props> = ({ onSave, onDelete, prices }) => {
	const [currency, setCurrency] = useState(currencyOptions[0].value);
	const [billingModel, setBillingModel] = useState(billingModels[0].value);
	const [meterId, setMeterId] = useState<string>();
	const [activeMeter, setActiveMeter] = useState<Meter | null>();
	const [tieredPrices, setTieredPrices] = useState<PriceTier[]>([
		{ from: 1, up_to: 1 },
		{ from: 2, up_to: null },
	]);
	const [billingPeriod, setBillingPeriod] = useState(billlingPeriodOptions[1].value);
	const [flatFee, setFlatFee] = useState<string>('');
	const [packagedFee, setPackagedFee] = useState<{ unit: string; price: string }>({
		unit: '',
		price: '',
	});

	const [errors, setErrors] = useState<Partial<Record<keyof Price, any>>>({});
	const [inputErrors, setInputErrors] = useState({
		flatModelError: '',
		packagedModelError: '',
		tieredModelError: '',
		invoiceCadenceError: '',
	});

	const [invoiceCadence, setInvoiceCadence] = useState('ARREAR');

	// Find the price that's currently being edited
	const editingPrice = prices.find((p) => p.isEdit);
	// const editingIndex = prices.findIndex((p) => p.isEdit);

	// Load price data when editing
	useEffect(() => {
		if (editingPrice) {
			setCurrency(editingPrice.currency || currencyOptions[0].value);
			setBillingModel(editingPrice.billing_model || billingModels[0].value);
			setMeterId(editingPrice.meter_id);
			if (editingPrice.meter) {
				setActiveMeter({
					id: editingPrice.meter.id,
					name: editingPrice.meter.name,
				} as Meter);
			}
			setBillingPeriod(editingPrice.billing_period || billlingPeriodOptions[1].value);

			if (editingPrice.billing_model === 'FLAT_FEE') {
				setFlatFee(editingPrice.amount || '');
			} else if (editingPrice.billing_model === 'PACKAGE') {
				setPackagedFee({
					price: editingPrice.amount || '',
					unit: editingPrice.transform_quantity?.divide_by?.toString() || '',
				});
			} else if (editingPrice.billing_model === 'TIERED' && Array.isArray(editingPrice.tiers)) {
				setTieredPrices(
					(editingPrice.tiers as TieredPrice[]).map((tier) => ({
						from: tier.from,
						up_to: tier.up_to,
						unit_amount: tier.unit_amount,
						flat_amount: tier.flat_amount,
					})),
				);
			}
		}
	}, [editingPrice]);

	const validate = () => {
		setErrors({});
		setInputErrors({
			flatModelError: '',
			packagedModelError: '',
			tieredModelError: '',
			invoiceCadenceError: '',
		});

		if (!meterId) {
			setErrors((prev) => ({ ...prev, meter_id: 'Feature is required' }));
			return false;
		}

		if (billingModel === billingModels[2].value) {
			for (let i = 0; i < tieredPrices.length; i++) {
				const upTo = tieredPrices[i].up_to;
				if (tieredPrices[i].from > (upTo === null ? 999999 : upTo)) {
					setInputErrors((prev) => ({
						...prev,
						tieredModelError: `From value cannot be smaller than up to in row ${i + 1}`,
					}));
					return false;
				}
			}
		}

		if (billingModel === billingModels[1].value) {
			if (packagedFee.price === '' || packagedFee.unit === '') {
				setInputErrors((prev) => ({ ...prev, packagedModelError: 'Invalid package fee' }));
				return false;
			}
		}

		if (billingModel === billingModels[0].value) {
			if (!flatFee || Number(flatFee) < 0) {
				setInputErrors((prev) => ({ ...prev, flatModelError: 'Invalid flat fee' }));
				return false;
			}
		}

		return true;
	};

	const handleCancel = () => {
		if (editingPrice) {
			// Just close the form without modifying the price data
			onSave({ ...editingPrice, isEdit: false });
		}
	};

	const handleSave = () => {
		if (!validate()) return;

		const basePrice: Partial<Price> = {
			meter_id: meterId,
			meter: activeMeter || undefined,
			currency,
			billing_period: billingPeriod,
			billing_model: billingModel,
			type: 'USAGE',
			billing_period_count: 1,
			billing_cadence: 'RECURRING',
			invoice_cadence: invoiceCadence,
		};

		let finalPrice: Partial<Price>;

		if (billingModel === billingModels[0].value) {
			finalPrice = {
				...basePrice,
				amount: flatFee,
			};
		} else if (billingModel === billingModels[1].value) {
			finalPrice = {
				...basePrice,
				amount: packagedFee.price,
				transform_quantity: {
					divide_by: Number(packagedFee.unit),
				},
			};
		} else {
			const adjustedTiers = tieredPrices.map((tier, index, array) => {
				if (!tier.up_to && index < array.length - 1) {
					const nextTier = array[index + 1];
					return {
						...tier,
						up_to: nextTier?.up_to ? nextTier.up_to - 1 : null,
					};
				}
				return tier;
			});

			finalPrice = {
				...basePrice,
				tiers: adjustedTiers.map((tier) => ({
					from: tier.from,
					up_to: tier.up_to ?? null,
					unit_amount: tier.unit_amount || '0',
					flat_amount: tier.flat_amount || '0',
				})) as unknown as NonNullable<Price['tiers']>,
				tier_mode: 'VOLUME',
			};
		}

		// If we're editing an existing price, preserve its ID and other important fields
		if (editingPrice) {
			const finalPriceWithEdit: InternalPrice = {
				...editingPrice,
				...finalPrice,
				type: 'USAGE',
				meter_id: meterId,
				meter: activeMeter || editingPrice.meter,
				isEdit: false,
			};

			onSave(finalPriceWithEdit);
		} else {
			onSave({
				...finalPrice,
				isEdit: false,
			} as InternalPrice);
		}
	};

	if (!editingPrice) {
		return (
			<div className='mb-2 space-y-2'>
				{prices.map((price, index) => (
					<UsagePriceItem key={index} price={price} index={index} onEdit={onSave} onDelete={onDelete} />
				))}
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
					setActiveMeter(meter);
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
					setBillingPeriod(value);
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

			{billingModel === billingModels[0].value && (
				<div className='space-y-2'>
					<Input
						placeholder='0'
						variant='formatted-number'
						error={inputErrors.flatModelError}
						label='Price'
						value={flatFee}
						inputPrefix={getCurrencySymbol(currency)}
						onChange={(e) => {
							setFlatFee(e);
						}}
						suffix={<span className='text-[#64748B]'>{`/ unit / ${formatBillingPeriodForPrice(billingPeriod)}`}</span>}
					/>
				</div>
			)}

			{billingModel === billingModels[1].value && (
				<div className='space-y-1'>
					<div className='flex w-full gap-2 items-end'>
						<Input
							variant='formatted-number'
							label='Price'
							placeholder='0'
							value={packagedFee.price}
							inputPrefix={getCurrencySymbol(currency)}
							onChange={(e) => setPackagedFee({ ...packagedFee, price: e })}
						/>
						<div className='h-[50px] items-center flex gap-2'>
							<p className='text-[#18181B] font-medium'>per</p>
						</div>
						<Input
							value={packagedFee.unit}
							variant='integer'
							placeholder='0'
							onChange={(e) =>
								setPackagedFee({
									...packagedFee,
									unit: e,
								})
							}
							suffix={`/ units / ${formatBillingPeriodForPrice(billingPeriod)}`}
						/>
					</div>
					{inputErrors.packagedModelError && <p className='text-red-500 text-sm'>{inputErrors.packagedModelError}</p>}
				</div>
			)}

			{billingModel === billingModels[2].value && (
				<VolumeTieredPricingForm setTieredPrices={setTieredPrices} tieredPrices={tieredPrices} currency={currency} />
			)}

			<Spacer height='16px' />
			<CheckboxRadioGroup
				title='Billing timing'
				value={invoiceCadence}
				checkboxItems={[
					{ label: 'Advance', value: 'ADVANCE', description: 'Customers are billed at the start of each billing period.' },

					{
						label: 'Arrear',
						value: 'ARREAR',
						description: 'Customers are billed at the end of each billing period, based on actual usage.',
					},
				]}
				onChange={(value) => {
					setInvoiceCadence(value);
				}}
				error={inputErrors.invoiceCadenceError}
			/>
			<Spacer height={'16px'} />
			<Spacer height='16px' />
			<div className='flex justify-end'>
				<Button onClick={handleCancel} variant='secondary' className='mr-4 text-zinc-900'>
					Cancel
				</Button>
				<Button onClick={handleSave} variant='default' className='mr-4 font-normal'>
					{/* {editingIndex !== null ? 'Update' : 'Add'} */}
					Add
				</Button>
			</div>
		</div>
	);
};

export default UsagePricingForm;
