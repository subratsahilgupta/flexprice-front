const CustomerCard: React.FC = () => {
	return (
		<div className='items-center justify-center'>
			<div className='p-6 rounded-xl border border-[#E4E4E7]'>
				<h1 className='text-2xl font-bold mb-6 text-gray-800'>Customer Details</h1>
				<div className='flex items-center space-x-6'>
					{/* Profile Photo */}
					<div className='w-20 h-20'>
						<img
							src={'https://picsum.photos/200/300'}
							alt='Customer Profile'
							className='w-full h-full rounded-full object-cover shadow-md'
						/>
					</div>
					{/* Customer Details */}
					<div className='flex flex-col space-y-2'>
						<div className='text-lg font-semibold text-gray-800'>Hitesh</div>
						<div className='text-sm text-gray-600'>hitesh@hitesh.com</div>
						<div className='text-sm text-gray-600'>1234567890</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerCard;
