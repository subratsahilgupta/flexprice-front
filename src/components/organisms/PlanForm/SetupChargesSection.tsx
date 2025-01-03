import { FormHeader, Input, Spacer } from '@/components/atoms';
import { IoRepeat } from 'react-icons/io5';
import { FiDatabase } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { SlPencil } from 'react-icons/sl';
import { MdOutlineDelete } from 'react-icons/md';
import { BsPlusCircle } from 'react-icons/bs';
import usePlanStore from '@/store/usePlanStore';
import RecurringChargesForm from './RecurringChargesForm';
import UsageBasedPricingForm from './UsageBasedPricingForm';

const subscriptionTypeOptions = [
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

const SetupChargesSection = () => {
	const metaData = usePlanStore((state) => state.metaData);
	const { setMetaDataField } = usePlanStore();

	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Plan Charges '}
				subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
				variant='sub-header'
			/>
			{
				<div className=''>
					<FormHeader title={'Select the Subscription Type'} variant='form-component-title' />
					<div className='w-full gap-4 grid grid-cols-2'>
						{subscriptionTypeOptions.map((type) => {
							const isActive = metaData?.subscriptionType === type.value;
							return (
								<button
									onClick={() => setMetaDataField('subscriptionType', type.value)}
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
				</div>
			}

			{metaData?.recurringPrice && (
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
								<button onClick={() => setMetaDataField('recurringPrice', {})}>
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
						<button onClick={() => {}} className='p-4 h-9 cursor-pointer flex gap-2 items-center  bg-[#F4F4F5] rounded-md '>
							<BsPlusCircle className='size-3  font-semibold' />
							<p className='text-[#18181B] font-medium '>Add Usage Based Charges</p>
						</button>
					</div>
				</div>
			)}

			{/* shoq reccuring type form */}
			{metaData?.subscriptionType === subscriptionTypeOptions[0].value && <RecurringChargesForm />}

			{metaData?.subscriptionType === subscriptionTypeOptions[1].value && <UsageBasedPricingForm />}
			<Spacer height={'16px'} />
		</div>
	);
};

export default SetupChargesSection;
