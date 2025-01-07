import Spinner from '../Spinner';

const Loader = () => {
	return (
		<div className='w-full h-full flex items-center justify-center bg-white/80 z-50'>
			<div className='flex flex-col items-center gap-2'>
				<Spinner size={50} className='text-primary' />
				<p className='text-sm text-gray-500'>Loading...</p>
			</div>
		</div>
	);
};

export default Loader;
