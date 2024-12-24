import { FC, ReactNode } from 'react';

interface Props {
	children?: ReactNode;
	title: string;
}

const SectionHeader: FC<Props> = ({ children, title }) => {
	return (
		<div className='w-full px-2 py-4 mb-4 flex items-center justify-between'>
			<h1 className='font-inter font-semibold text-[14px]'>{title}</h1>
			<div>{children}</div>
		</div>
	);
};

export default SectionHeader;
