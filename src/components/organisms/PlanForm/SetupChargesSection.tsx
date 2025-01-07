import { FormHeader, Spacer } from '@/components/atoms';
import { IoRepeat } from 'react-icons/io5';
import { FiDatabase } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import usePlanStore from '@/store/usePlanStore';
import RecurringChargesForm from './RecurringChargesForm';
import UsageBasedPricingFormSection from './UsageBasedPricingFormSection';
import { ReactSVG } from 'react-svg';

export const subscriptionTypeOptions = [
	{ value: 'FIXED', label: 'Recurring', icon: IoRepeat },
	{ value: 'USAGE', label: 'Usage Based', icon: FiDatabase },
];

export const AddChargesButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
	<button onClick={onClick} className='p-4 h-9 cursor-pointer flex gap-2 items-center bg-[#F4F4F5] rounded-md'>
		<ReactSVG src='/assets/svg/CirclePlus.svg' />
		<p className='text-[#18181B] text-sm font-medium'>{label}</p>
	</button>
);

const SetupChargesSection = () => {
	const { setMetaDataField } = usePlanStore();
	const metaData = usePlanStore((state) => state.metaData);

	const isSubscriptionBtnVisible = () => {
		const usagePrices = metaData?.usagePrices;
		const recurringPrice = metaData?.recurringPrice;

		if ((usagePrices?.length ?? 0) > 0 && !recurringPrice) {
			return Object.keys(usagePrices![0] ?? {}).length === 0;
		}

		return !usagePrices && !recurringPrice;
	};

	const handleSubscriptionTypeChange = (type: (typeof subscriptionTypeOptions)[0]) => {
		setMetaDataField('subscriptionType', type.value);
		setMetaDataField('isRecurringEditMode', type.value === subscriptionTypeOptions[0].value);
		setMetaDataField('usagePrices', undefined);
		setMetaDataField('recurringPrice', undefined);
		setMetaDataField('isUsageEditMode', type.value === subscriptionTypeOptions[1].value);
	};

	const renderSubscriptionTypeButton = (type: (typeof subscriptionTypeOptions)[0]) => {
		const isActive = metaData?.subscriptionType === type.value;
		return (
			<button
				key={type.value}
				onClick={() => handleSubscriptionTypeChange(type)}
				className={cn(
					'p-3 rounded-md border-2 w-full flex flex-col justify-center items-center',
					isActive ? 'border-[#0F172A]' : 'border-[#E2E8F0]',
				)}>
				{type.icon && <type.icon size={24} className='text-[#020617]' />}
				<p className='text-[#18181B] font-medium mt-2'>{type.label}</p>
			</button>
		);
	};

	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader title='Plan Charges' subtitle='Choose the appropriate subscription model for this pricing plan.' variant='sub-header' />

			{/* Subscription Type Section */}
			{isSubscriptionBtnVisible() && (
				<div>
					<FormHeader title='Select the Subscription Type' variant='form-component-title' />
					<div className='w-full gap-4 grid grid-cols-2'>{subscriptionTypeOptions.map(renderSubscriptionTypeButton)}</div>
					<Spacer height='4px' />
					<p className='text-sm text-muted-foreground'>
						{metaData?.subscriptionType === subscriptionTypeOptions[0].value
							? 'Customers are charged on a recurring basis (e.g., monthly or yearly).'
							: 'Customers are charged based on their actual usage (e.g., per API call, compute time).'}
					</p>

					<Spacer height='16px' />
				</div>
			)}

			{/* Conditional Forms */}
			<Spacer height='4px' />
			{metaData?.subscriptionType && (
				<>
					<RecurringChargesForm />
					<UsageBasedPricingFormSection />
				</>
			)}

			<Spacer height='16px' />
			{/* <pre>{JSON.stringify(metaData, null, 2)}</pre> */}
		</div>
	);
};

export default SetupChargesSection;
