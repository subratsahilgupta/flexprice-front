import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import SelectMeter from './SelectMeter';
import usePlanStore from '@/store/usePlanStore';

const RecurringChargesForm = () => {
	const { setMetaDataField } = usePlanStore();

	const recurringPrice = usePlanStore((state) => state.metaData?.recurringPrice);

	const currencyOptions = [
		{ label: 'USD', value: 'USD', currency: '$' },
		{ label: 'INR', value: 'INR', currency: '₹' },
	];

	const billlingPeriodOptions = [
		{ label: 'Monthly', value: 'monthly' },
		{ label: 'Yearly', value: 'yearly' },
	];

	const mapCurrency = (currency: string) => {
		const selectedCurrency = currencyOptions.find((option) => option.value === currency);
		return selectedCurrency?.currency;
	};

	const [amount, setamount] = useState<number | undefined>(recurringPrice?.amount);
	const [billingPeriod, setbillingPeriod] = useState(recurringPrice?.billingPeriod || billlingPeriodOptions[0].value);

	const [currency, setcurrency] = useState(recurringPrice?.currency || currencyOptions[0].value);

	const handleAddRecurringPrice = () => {
		setMetaDataField('recurringPrice', {
			amount,
			currency,
			billingPeriod,
		});
	};

	return (
		<div className=''>
			<FormHeader title='Recurring Fee' variant='form-component-title' />

			<SelectMeter />
			<Spacer height={'8px'} />
			<Select
				selectedValue={currency}
				options={currencyOptions}
				label='Select Currency'
				onChange={setcurrency}
				placeholder='Select Currency'
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
			/>
			<Spacer height={'8px'} />
			<Input
				onChange={(value) => {
					setamount(Number(value));
				}}
				value={amount}
				type='number'
				label='Value'
				inputPrefix={mapCurrency(currency)}
				suffix={<span className='text-[#64748B]'>per month</span>}
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
	);
};

export default RecurringChargesForm;
