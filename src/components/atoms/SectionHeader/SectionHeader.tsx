import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';
import { Button } from '..';
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
	className,
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
		<div className={cn('w-full py-3 px-2 flex items-center justify-between', className)}>
			<p className='text-xl font-[600] text-zinc-950'>{title}</p>
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
					<Button onClick={onButtonClick}>
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
