const CreatePlanPage = () => {
	const labelStyle = 'text-muted-foreground text-sm';

	return (
		<div>
			<div className='p-6'>
				<p className='font-bold text-zinc text-[20px]'>Create Plan</p>
				<p className={labelStyle}>Make changes to your pricing plans here. Click save when you're done.</p>
			</div>
		</div>
	);
};

export default CreatePlanPage;
