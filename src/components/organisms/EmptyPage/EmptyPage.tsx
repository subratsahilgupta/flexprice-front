import { Spacer } from '@/components/atoms';
import { FC, ReactNode } from 'react';
import { ReactSVG } from 'react-svg';
import { AddButton } from '@/components/atoms';
interface Props {
	children?: ReactNode;
	title?: string;
	description?: string;
	onAddClick?: () => void;
}

const EmptyPage: FC<Props> = ({ children, title, description, onAddClick }) => {
	return (
		<div className='h-screen w-full flex justify-center items-center'>
			<div className='w-full flex flex-col items-center '>
				<ReactSVG src={'/assets/svg/empty box.svg'} />
				{title && <p className='font-sans text-2xl font-bold'>{title}</p>}
				{description && <p className='text-[#71717A] font-normal '>{description}</p>}
				<Spacer height={'16px'} />
				{onAddClick && <AddButton onClick={onAddClick} />}
				{children}
			</div>
		</div>
	);
};

export default EmptyPage;
