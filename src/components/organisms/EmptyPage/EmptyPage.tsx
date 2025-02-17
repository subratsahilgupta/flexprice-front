import { Spacer } from '@/components/atoms';
import { FC, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';

interface Props {
	children?: ReactNode;
	title?: string;
	description?: string;
}

const EmptyPage: FC<Props> = ({ children, title, description }) => {
	return (
		<div className='h-screen w-full flex justify-center items-center'>
			<div className='w-full flex flex-col items-center '>
				<ReactSVG src={'/assets/svg/empty box.svg'} />
				{title && <p className='font-sans text-2xl font-bold'>{title}</p>}
				{description && <p className='text-[#71717A] font-normal '>{description}</p>}
				<Spacer height={'16px'} />
				{children}
			</div>
		</div>
	);
};

export default EmptyPage;
