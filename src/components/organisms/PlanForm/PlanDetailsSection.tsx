import { FormHeader, Input, Spacer, Textarea } from '@/components/atoms';
import usePlanStore from '@/store/usePlanStore';

const PlanDetailsSection = () => {
	const { plan, setPlanField, errors } = usePlanStore();

	return (
		<div className='p-6  rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Plan Details'}
				subtitle={'Provide details about your pricing plan to help organize and track event data efficiently.'}
				variant='sub-header'
			/>
			<Input
				placeholder='Enter a name for the plan'
				description={'A descriptive name to identify this pricing plan.'}
				label='Plan Name'
				value={plan.name}
				error={errors.name}
				onChange={(e) => {
					setPlanField('name', e);
					setPlanField('lookup_key', 'plan-' + e.replace(/\s/g, '-').toLowerCase());
				}}
			/>

			<Spacer height={'20px'} />
			<Input
				error={errors.lookup_key}
				onChange={(e) => setPlanField('lookup_key', e)}
				value={plan.lookup_key}
				placeholder='Enter a slug for the plan'
				description={'A unique identifier for this plan, used as a reference in API calls and system integrations.'}
				label='Plan Slug'
			/>
			<Spacer height={'20px'} />
			<Textarea
				value={plan.description}
				onChange={(e) => setPlanField('description', e)}
				className='min-h-[100px]'
				placeholder='Enter description'
				label='Plan Description'
				description='Helps your team to understand the purpose of this plan.'
			/>
		</div>
	);
};

export default PlanDetailsSection;
