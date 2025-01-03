import { FormHeader, Spacer } from '@/components/atoms';
import { IoRepeat } from 'react-icons/io5';
import { FiDatabase } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import usePlanStore from '@/store/usePlanStore';
import RecurringChargesForm from './RecurringChargesForm';
import UsageBasedPricingForm from './UsageBasedPricingForm';
import { ReactSVG } from 'react-svg';
import { Pencil, Trash2 } from 'lucide-react';

export const subscriptionTypeOptions = [
	{ value: 'RECURRING', label: 'Recurring', icon: IoRepeat },
	{ value: 'ONETIME', label: 'Usage Based', icon: FiDatabase },
];

const AddChargesButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
	<button onClick={onClick} className='p-4 h-9 cursor-pointer flex gap-2 items-center bg-[#F4F4F5] rounded-md'>
		<ReactSVG src='/assets/svg/CirclePlus.svg' />
		<p className='text-[#18181B] text-sm font-medium'>{label}</p>
	</button>
);

const SetupChargesSection = () => {
	const { setMetaDataField } = usePlanStore();
	const metaData = usePlanStore((state) => state.metaData);

	const handleSubscriptionTypeChange = (type: (typeof subscriptionTypeOptions)[0]) => {
		setMetaDataField('subscriptionType', type.value);
		setMetaDataField('isRecurringEditMode', type.value === subscriptionTypeOptions[0].value);
		setMetaDataField('isUsageEditMode', type.value === subscriptionTypeOptions[1].value);
	};

	const handleEdit = () => {
		setMetaDataField(metaData?.subscriptionType === subscriptionTypeOptions[0].value ? 'isRecurringEditMode' : 'isUsageEditMode', true);
		setMetaDataField(metaData?.subscriptionType === subscriptionTypeOptions[0].value ? 'isUsageEditMode' : 'isRecurringEditMode', false);
	};

	const handleDelete = () => {
		if (metaData?.subscriptionType === subscriptionTypeOptions[0].value) {
			setMetaDataField('recurringPrice', undefined);
		} else {
			setMetaDataField('usageBasedPrice', undefined);
		}
		setMetaDataField('subscriptionType', undefined);
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
			<FormHeader
				title='Plan Charges'
				subtitle='Name of the property key in the data object. The groups should only include low cardinality fields.'
				variant='sub-header'
			/>

			{/* Subscription Type Section */}
			{!metaData?.recurringPrice && !metaData?.usageBasedPrice && (
				<div>
					<FormHeader title='Select the Subscription Type' variant='form-component-title' />
					<div className='w-full gap-4 grid grid-cols-2'>{subscriptionTypeOptions.map(renderSubscriptionTypeButton)}</div>
					<Spacer height='4px' />
					<p className='text-sm text-muted-foreground'>Default subscription means... Subscription means lorem ipsum</p>
					<Spacer height='16px' />
				</div>
			)}

			{/* Charges Section */}
			{(metaData?.recurringPrice || metaData?.usageBasedPrice) && (
				<div>
					<FormHeader
						title={metaData?.subscriptionType === subscriptionTypeOptions[0].value ? 'Recurring Charges' : 'Usage Based Charges'}
						variant='sub-header'
					/>

					{/* Edit/Delete CTA */}
					<div className='gap-2 w-full flex justify-between group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:opacity-50 md:text-sm disabled:cursor-not-allowed'>
						<p>{metaData?.subscriptionType === subscriptionTypeOptions[0].value ? 'Recurring' : 'Usage Based'}</p>
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

					<div className='border-b border-[#F4F4F5] w-full my-3' />

					<div className='w-full flex items-center flex-wrap gap-2'>
						{/* Dynamic Add Charges Button */}

						{metaData.subscriptionType === subscriptionTypeOptions[1].value && (
							<AddChargesButton onClick={() => setMetaDataField('isRecurringEditMode', true)} label='Add Recurring Charges' />
						)}

						<AddChargesButton onClick={() => setMetaDataField('isUsageEditMode', true)} label='Add Usage Based Charges' />
					</div>
				</div>
			)}

			{/* Conditional Forms */}
			<Spacer height='16px' />
			{metaData?.subscriptionType && (
				<>
					<RecurringChargesForm />
					<UsageBasedPricingForm />
				</>
			)}

			<Spacer height='16px' />
		</div>
	);
};

export default SetupChargesSection;
