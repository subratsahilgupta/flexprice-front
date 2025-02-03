import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface Props {
	children?: ReactNode;
	title: string;
	className?: string;
}

const SectionHeader: FC<Props> = ({ children, title, className }) => {
	return (
		<div className={cn('w-full px-2 py-4 mb-4 flex items-center justify-between', className)}>
			<h1 className='font-inter font-bold text-xl '>{title}</h1>
			<div>{children}</div>
		</div>
	);
};

export default SectionHeader;
