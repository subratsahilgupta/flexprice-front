import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';
import { Button, FormHeader } from '..';
import { IoSearch } from 'react-icons/io5';
import { SlidersHorizontal } from 'lucide-react';

interface Props {
	children?: ReactNode;
	title: string;
	className?: string;
	showSearch?: boolean;
	onSearch?: (value: string) => void;
	onSearchClick?: () => void;
	variant?: 'form-component-title' | 'sub-header' | 'form-title' | 'default';
	onFilterClick?: () => void;
	showFilter?: boolean;
	showButton?: boolean;
	buttonIcon?: ReactNode;
	buttonText?: string;
	onButtonClick?: () => void;
	optionsClassName?: string;
	subtitle?: string;
}

const SectionHeader: FC<Props> = ({
	children,
	title,
	subtitle,
	className,
	variant = 'default',
	onFilterClick,
	onSearchClick,
	showFilter,
	showSearch,
	showButton,
	buttonIcon,
	buttonText,
	onButtonClick,
	optionsClassName,
}) => {
	return (
		<div className={cn('w-full mb-4 flex items-center justify-between', className)}>
			<FormHeader subtitle={subtitle} className='m-0' title={title} variant={variant} />
			<div className={cn('flex gap-2 items-center', optionsClassName)}>
				{showSearch && (
					<button onClick={onSearchClick} className='px-2 py-1'>
						<IoSearch className='size-4 font-extralight text-[#09090B] ' />
					</button>
				)}
				{showFilter && (
					<button onClick={onFilterClick} className='px-2 py-1'>
						<SlidersHorizontal className='size-4 text-[#09090B] ' />
					</button>
				)}
				{showButton && (
					<Button onClick={onButtonClick} className='w-32 flex gap-2 bg-[#0F172A] '>
						{buttonIcon}
						<span>{buttonText}</span>
					</Button>
				)}
				{children}
			</div>
		</div>
	);
};

export default SectionHeader;
