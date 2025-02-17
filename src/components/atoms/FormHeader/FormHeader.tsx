import { cn } from '@/lib/utils';
import { FC } from 'react';

interface Props {
	title?: string;
	subtitle?: string;
	variant: 'form-component-title' | 'sub-header' | 'form-title' | 'default';
	className?: string;
	titleClassName?: string;
	subtitleClassName?: string;
}

const FormTitle: FC<Props> = ({ variant, subtitle, title, className, subtitleClassName, titleClassName }) => {
	const labelStyle = '!text-zinc-500 text-normal text-sm';

	if (variant === 'form-title') {
		return (
			<div className={className}>
				{title && <p className={cn('font-bold text-zinc text-[20px]', titleClassName)}>{title}</p>}
				{subtitle && <p className={cn(labelStyle, subtitleClassName)}>{subtitle}</p>}
			</div>
		);
	}

	if (variant === 'default') {
		return (
			<div className={className}>
				<h1 className='font-inter font-bold text-xl '>{title}</h1>
				<p className={cn(labelStyle, subtitleClassName)}>{subtitle}</p>
			</div>
		);
	}

	if (variant === 'sub-header') {
		return (
			<div className={cn('mb-4', className)}>
				<p className={cn('font-inter font-semibold text-base', titleClassName)}>{title}</p>
				<p className={cn(labelStyle, subtitleClassName)}>{subtitle}</p>
			</div>
		);
	}

	if (variant === 'form-component-title') {
		return (
			<div className={cn('mb-0', className)}>
				{title && <p className={cn('text-sm text-zinc-950 font-medium font-inter mb-2', titleClassName)}>{title}</p>}
				{subtitle && <p className={cn(labelStyle, subtitleClassName)}>{subtitle}</p>}
			</div>
		);
	}

	return <div></div>;
};

export default FormTitle;
