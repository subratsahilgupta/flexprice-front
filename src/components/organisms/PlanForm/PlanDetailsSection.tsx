import { FormHeader, Input, Spacer, Textarea } from '@/components/atoms';
import usePlanStore from '@/store/usePlanStore';

const PlanDetailsSection = () => {
	const { plan, setPlanField, errors } = usePlanStore();
	console.log('PlanDetailsSection', plan, errors);

	return (
		<div className='p-6  rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Plan Details'}
				subtitle={'Assign a name to your event schema to easily identify and track events processed.'}
				variant='sub-header'
			/>
			<Input
				placeholder='Enter a name for the plan'
				description={'A unique identifier for the meter. This is used to refer the meter in the Flexprice APIs.'}
				label='Plan Name*'
				value={plan.name}
				error={errors.name}
				onChange={(e) => {
					setPlanField('name', e);
					setPlanField('lookup_key', 'plan-' + e.replace(/\s/g, '-').toLowerCase());
				}}
			/>
			<Spacer height={'20px'} />
			<Input
				onChange={(e) => setPlanField('lookup_key', e)}
				value={plan.lookup_key}
				placeholder='Enter a slug for the plan'
				description={'A slug for the meter.'}
				label='Plan Slug'
			/>
			<Spacer height={'20px'} />
			<Textarea
				value={plan.description}
				onChange={(e) => setPlanField('description', e)}
				className='min-h-[100px]'
				placeholder='Enter description'
				label='Plan Description'
				description='Your message will be copied to the support team.'
			/>
		</div>
	);
};

export default PlanDetailsSection;
