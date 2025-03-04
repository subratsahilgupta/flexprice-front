import { FormHeader, Spacer } from '@/components/atoms';
import { IoRepeat } from 'react-icons/io5';
import { FiDatabase } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { ReactSVG } from 'react-svg';
import { Plan } from '@/models/Plan';
import { useState } from 'react';
import { Price } from '@/models/Price';
import { currencyOptions, billlingPeriodOptions } from '@/core/data/constants';
import RecurringChargesForm from './RecurringChargesForm';
import UsagePricingForm from './UsagePricingForm';
interface Props {
	plan: Partial<Plan>;
	setPlanField: <K extends keyof Plan>(field: K, value: Plan[K]) => void;
}

enum SubscriptionType {
	FIXED = 'FIXED',
	USAGE = 'USAGE',
}

export const subscriptionTypeOptions = [
	{ value: SubscriptionType.FIXED, label: 'Recurring', icon: IoRepeat },
	{ value: SubscriptionType.USAGE, label: 'Usage Based', icon: FiDatabase },
];

interface AddChargesButtonProps {
	onClick: () => void;
	label: string;
}

export const AddChargesButton = ({ onClick, label }: AddChargesButtonProps) => (
	<button onClick={onClick} className='p-4 h-9 cursor-pointer flex gap-2 items-center bg-[#F4F4F5] rounded-md'>
		<ReactSVG src='/assets/svg/CirclePlus.svg' />
		<p className='text-[#18181B] text-sm font-medium'>{label}</p>
	</button>
);

export interface InternalPrice extends Partial<Price> {
	isEdit?: boolean;
}

const SetupChargesSection: React.FC<Props> = ({ plan, setPlanField }) => {
	const [subscriptionType, setSubscriptionType] = useState<string>();
	const [prices, setPrices] = useState<InternalPrice[]>(plan.prices || []);

	const getEmptyPrice = (type: SubscriptionType): InternalPrice => ({
		amount: '',
		currency: currencyOptions[0].value,
		billing_period: billlingPeriodOptions[1].value,
		type,
		isEdit: true,
		billing_model: type === SubscriptionType.FIXED ? 'FLAT_FEE' : undefined,
		billing_cadence: 'RECURRING',
	});

	const handleSubscriptionTypeChange = (type: (typeof subscriptionTypeOptions)[0]) => {
		setSubscriptionType(type.value);
		if (prices.length === 0) {
			setPrices([getEmptyPrice(type.value as SubscriptionType)]);
		}
	};

	const updatePrices = (newPrices: InternalPrice[]) => {
		setPrices(newPrices);
		setPlanField('prices', newPrices as unknown as Price[]);
	};

	const handlePriceUpdate = (index: number, price: InternalPrice) => {
		const newPrices = prices.map((p, i) => (i === index ? price : p));
		updatePrices(newPrices);
	};

	const handlePriceDelete = (index: number) => {
		const newPrices = prices.filter((_, i) => i !== index);
		if (newPrices.length === 0) {
			setSubscriptionType(undefined);
		}
		updatePrices(newPrices);
	};

	const handleAddNewPrice = (type: SubscriptionType) => {
		if (type === SubscriptionType.FIXED && prices.filter((p) => p.type === SubscriptionType.FIXED).length > 0) {
			return;
		}

		setSubscriptionType(type);
		const newPrice = getEmptyPrice(type);
		updatePrices([...prices, newPrice]);
	};

	const fixedPrices = prices.filter((p) => p.type === SubscriptionType.FIXED);
	const usagePrices = prices.filter((p) => p.type === SubscriptionType.USAGE);

	const isEditing = prices.some((p) => p.isEdit);
	const showAddButtons = Boolean(subscriptionType) && !isEditing;
	const canAddFixedPrices = showAddButtons && fixedPrices.length === 0;
	const canAddUsagePrices = showAddButtons;

	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			{/* Subscription Type Section */}
			{!prices.length && (
				<div>
					<FormHeader
						title='Plan Charges'
						subtitle='Choose the appropriate subscription model for this pricing plan.'
						variant='sub-header'
					/>
					<FormHeader title='Select the Subscription Type' variant='form-component-title' />
					<div className='w-full gap-4 grid grid-cols-2'>
						{subscriptionTypeOptions.map((type) => (
							<button
								key={type.value}
								onClick={() => handleSubscriptionTypeChange(type)}
								className={cn(
									'p-3 rounded-md border-2 w-full flex flex-col justify-center items-center',
									subscriptionType === type.value ? 'border-[#0F172A]' : 'border-[#E2E8F0]',
								)}>
								{type.icon && <type.icon size={24} className='text-[#020617]' />}
								<p className='text-[#18181B] font-medium mt-2'>{type.label}</p>
							</button>
						))}
					</div>
					<Spacer height='4px' />
					<p className='text-sm text-muted-foreground'>
						{subscriptionType === SubscriptionType.FIXED
							? 'Customers are charged on a recurring basis (e.g., monthly or yearly).'
							: 'Customers are charged based on their actual usage (e.g., per API call, compute time).'}
					</p>
					<Spacer height='16px' />
				</div>
			)}

			{/* Fixed Price Forms */}
			{fixedPrices.length > 0 && (
				<div>
					<h3 className='text-lg font-medium mb-4'>Recurring Charges</h3>
					{fixedPrices.map((price, index) => {
						// Find the global index in the prices array
						const globalIndex = prices.findIndex((p) => p === price);
						return (
							<RecurringChargesForm
								key={index}
								price={price}
								isEdit={price.isEdit || false}
								onAdd={(newPrice) => {
									handlePriceUpdate(globalIndex, {
										...newPrice,
										type: SubscriptionType.FIXED,
										isEdit: false,
									});
								}}
								onUpdate={(newPrice) => {
									if (newPrice.isEdit) {
										// Just update the edit state
										handlePriceUpdate(globalIndex, {
											...price,
											isEdit: true,
										});
									} else {
										// Update the price while preserving the type
										handlePriceUpdate(globalIndex, {
											...newPrice,
											type: SubscriptionType.FIXED,
											isEdit: false,
										});
									}
								}}
								onDelete={() => handlePriceDelete(globalIndex)}
							/>
						);
					})}
				</div>
			)}

			{/* Usage Price Forms */}
			{usagePrices.length > 0 && (
				<div className='mt-6'>
					<h3 className='text-lg font-medium mb-4'>Usage Based Charges</h3>
					<UsagePricingForm
						prices={usagePrices}
						onSave={(newPrice) => {
							const existingIndex = usagePrices.findIndex((p) => p.isEdit);
							if (existingIndex !== -1) {
								// Update existing price
								const globalIndex = prices.findIndex((p) => p === usagePrices[existingIndex]);
								// Preserve the type and ensure it stays as USAGE
								handlePriceUpdate(globalIndex, {
									...newPrice,
									type: SubscriptionType.USAGE,
									isEdit: false,
								});
							} else if (newPrice.isEdit) {
								// Set a price to edit mode
								const globalIndex = prices.findIndex((p) => p === usagePrices.find((up) => up === newPrice));
								handlePriceUpdate(globalIndex, {
									...prices[globalIndex],
									type: SubscriptionType.USAGE,
									isEdit: true,
								});
							} else {
								// Add new price
								updatePrices([
									...prices,
									{
										...newPrice,
										type: SubscriptionType.USAGE,
										isEdit: false,
									},
								]);
							}
						}}
						onDelete={(index) => {
							const globalIndex = prices.findIndex((p) => p === usagePrices[index]);
							handlePriceDelete(globalIndex);
						}}
					/>
				</div>
			)}

			{/* Add Charges Buttons */}
			{showAddButtons && (
				<div className='mt-6'>
					{canAddFixedPrices && (
						<AddChargesButton onClick={() => handleAddNewPrice(SubscriptionType.FIXED)} label='Add Recurring Charges' />
					)}
					{canAddUsagePrices && (
						<>
							{canAddFixedPrices && <Spacer height='8px' />}
							<AddChargesButton
								onClick={() => {
									const newPrice = getEmptyPrice(SubscriptionType.USAGE);
									updatePrices([...prices, { ...newPrice, isEdit: true }]);
									setSubscriptionType(SubscriptionType.USAGE);
								}}
								label='Add Usage Based Charges'
							/>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default SetupChargesSection;
