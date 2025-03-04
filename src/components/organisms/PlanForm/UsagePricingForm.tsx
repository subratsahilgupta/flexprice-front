import { Price } from '@/models/Price';
import { FC, useState, useEffect } from 'react';
import { Button, Input, Select, Spacer } from '@/components/atoms';
import SelectMeter from './SelectMeter';
import { Pencil, Trash2 } from 'lucide-react';
import { Meter } from '@/models/Meter';
import { formatBillingPeriod, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { billlingPeriodOptions, currencyOptions } from '@/core/data/constants';
import VolumeTieredPricingForm from './VolumeTieredPricingForm';
import { InternalPrice } from './SetupChargesSection';

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
	});

	// Find the price that's currently being edited
	const editingPrice = prices.find((p) => p.isEdit);
	const editingIndex = prices.findIndex((p) => p.isEdit);

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
			finalPrice = {
				...editingPrice,
				...finalPrice,
				type: 'USAGE', // Always ensure it stays as USAGE type
				meter_id: meterId,
				meter: activeMeter || editingPrice.meter,
			};
		}

		onSave(finalPrice as InternalPrice);
		resetForm();
	};

	const resetForm = () => {
		setCurrency(currencyOptions[0].value);
		setBillingModel(billingModels[0].value);
		setMeterId(undefined);
		setActiveMeter(null);
		setBillingPeriod(billlingPeriodOptions[1].value);
		setFlatFee('');
		setPackagedFee({ unit: '', price: '' });
		setTieredPrices([
			{ from: 1, up_to: 1 },
			{ from: 2, up_to: null },
		]);
		setErrors({});
		setInputErrors({
			flatModelError: '',
			packagedModelError: '',
			tieredModelError: '',
		});
	};

	if (!editingPrice) {
		return (
			<div className='mb-2 space-y-2'>
				{prices.map((price, index) => (
					<div
						key={index}
						className='gap-2 w-full flex justify-between group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground hover:bg-gray-50 transition-colors'>
						<div>
							<p className='font-normal text-sm'>
								{price.meter_id
									? `${prices.find((p) => p.meter_id === price.meter_id)?.meter?.name || 'Usage Based Charge'}`
									: 'New Usage Charge'}
							</p>
							<div className='flex gap-2 items-center text-zinc-500 text-xs'>
								<span>{price.currency}</span>
								<span>•</span>
								<span>{toSentenceCase(price.billing_period || '')}</span>
								{price.billing_model && (
									<>
										<span>•</span>
										<span>{toSentenceCase(price.billing_model)}</span>
									</>
								)}
							</div>
						</div>
						<span className='text-[#18181B] flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity'>
							<button onClick={() => onSave({ ...price, isEdit: true } as InternalPrice)} className='p-1 hover:bg-gray-100 rounded-md'>
								<Pencil size={16} />
							</button>
							<div className='border-r h-[16px] border-[#E4E4E7]' />
							<button onClick={() => onDelete(index)} className='p-1 hover:bg-gray-100 rounded-md text-red-500'>
								<Trash2 size={16} />
							</button>
						</span>
					</div>
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
						suffix={<span className='text-[#64748B]'>{`/ unit / ${formatBillingPeriod(billingPeriod)}`}</span>}
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
				<Button onClick={resetForm} variant='secondary' className='mr-4 text-zinc-900'>
					Cancel
				</Button>
				<Button onClick={handleSave} variant='default' className='mr-4 font-normal'>
					{editingIndex !== null ? 'Update' : 'Add'}
				</Button>
			</div>
		</div>
	);
};

export default UsagePricingForm;
