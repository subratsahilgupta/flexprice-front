import { FormHeader, Input, Spacer, Textarea } from '@/components/atoms';

const PlanDetailsSection = () => {
	return (
		<div className='p-6 rounded-xl border border-[#E4E4E7]'>
			<FormHeader
				title={'Plan Details'}
				subtitle={'Assign a name to your event schema to easily identify and track events processed.'}
				variant='sub-header'
			/>
			<Input
				placeholder='Enter a name for the plan'
				description={'A unique identifier for the meter. This is used to refer the meter in the Flexprice APIs.'}
				label='Plan Name*'
			/>
			<Spacer height={'20px'} />
			<Textarea
				className='min-h-[100px]'
				placeholder='Enter description'
				label='Plan Description'
				description='Your message will be copied to the support team.'
			/>
		</div>
	);
};

export default PlanDetailsSection;
