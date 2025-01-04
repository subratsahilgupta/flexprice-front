import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import usePlanStore, { Price } from '@/store/usePlanStore';

const RecurringChargesForm = () => {
	const { setMetaDataField, clearAllErrors } = usePlanStore();
	const metaData = usePlanStore((state) => state.metaData);

	const recurringPrice = usePlanStore((state) => state.metaData?.recurringPrice);

	const currencyOptions = [
		{ label: 'USD', value: 'USD', currency: '$' },
		{ label: 'INR', value: 'INR', currency: '₹' },
	];

	const billlingPeriodOptions = [
		{ label: 'Daily', value: 'DAILY' },
		{ label: 'Weekly', value: 'WEEKLY' },
		{ label: 'Monthly', value: 'MONTHLY' },
		{ label: 'Yearly', value: 'ANNUAL' },
	];

	const mapCurrency = (currency: string) => {
		const selectedCurrency = currencyOptions.find((option) => option.value === currency);
		return selectedCurrency?.currency;
	};

	const [amount, setamount] = useState<string>(recurringPrice?.amount || '');
	const [billingPeriod, setbillingPeriod] = useState(recurringPrice?.billing_period || billlingPeriodOptions[0].value);

	const [currency, setcurrency] = useState(recurringPrice?.currency || currencyOptions[0].value);

	const [errors, seterrors] = useState<Partial<Record<keyof Price, any>>>({});

	const handleAddRecurringPrice = () => {
		clearAllErrors();
		if (!amount) {
			seterrors((prev) => ({ ...prev, amount: 'Amount is required' }));
			return;
		}

		if (!billingPeriod) {
			seterrors((prev) => ({ ...prev, billingPeriod: 'Billing Period is required' }));
			return;
		}

		setMetaDataField('recurringPrice', {
			amount,
			currency,
			billing_period: billingPeriod,
		});
		setMetaDataField('isRecurringEditMode', false);
	};

	return (
		<>
			{metaData?.isRecurringEditMode && (
				<div>
					<FormHeader title='Recurring Fee' variant='form-component-title' />

					<Spacer height={'8px'} />
					<Select
						selectedValue={currency}
						options={currencyOptions}
						label='Select Currency'
						onChange={setcurrency}
						placeholder='Select Currency'
						error={errors.currency}
					/>
					<Spacer height={'8px'} />
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
					<Input
						onChange={(value) => {
							setamount(value);
						}}
						value={amount}
						type='number'
						label='Value'
						error={errors.amount}
						inputPrefix={mapCurrency(currency)}
						suffix={<span className='text-[#64748B]'> /{billingPeriod.toLocaleLowerCase()}</span>}
					/>
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
		</>
	);
};

export default RecurringChargesForm;
