import { Button, Spacer } from '@/components/atoms';
import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
	return (
		<div className='h-screen w-full flex justify-center items-center'>
			<div className='w-full flex flex-col items-center '>
				<TriangleAlert className='size-28' />
				<p className='font-sans text-2xl font-bold'>404 Error Page</p>
				<p className='text-[#71717A] font-normal '>Oops! Looks like you took a wrong turn</p>
				<Spacer height={'16px'} />
				<Link to='/usage-tracking/meter/add-meter'>
					<Button className='w-32 flex gap-2 bg-[#0F172A] '>
						<span>Back to Home</span>
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default ErrorPage;
