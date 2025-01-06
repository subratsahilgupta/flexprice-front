import { cn } from '@/lib/utils';
import { FC } from 'react';

interface Props {
	title?: string;
	subtitle?: string;
	variant: 'form-component-title' | 'sub-header' | 'form-title';
	className?: string;
}

const FormTitle: FC<Props> = ({ variant, subtitle, title, className }) => {
	const labelStyle = 'text-zinc-500 text-normal text-sm';

	if (variant === 'form-title') {
		return (
			<div className={className}>
				<p className='font-bold text-zinc text-[20px]'>{title}</p>
				<p className={labelStyle}>{subtitle}</p>
			</div>
		);
	}

	if (variant === 'sub-header') {
		return (
			<div className={cn('mb-4', className)}>
				<p className='font-inter font-semibold text-base'>{title}</p>
				<p className={labelStyle}>{subtitle}</p>
			</div>
		);
	}

	if (variant === 'form-component-title') {
		return (
			<div className={cn('mb-0', className)}>
				<p className='text-sm text-zinc-950 font-medium font-inter mb-2'>{title}</p>
				<p className={labelStyle}>{subtitle}</p>
			</div>
		);
	}

	return <div></div>;
};

export default FormTitle;
