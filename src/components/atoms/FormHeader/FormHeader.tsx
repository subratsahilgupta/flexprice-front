import { FC } from 'react';

interface Props {
	title?: string;
	subtitle?: string;
	variant: 'form-component-title' | 'sub-header' | 'form-title';
}

const FormTitle: FC<Props> = ({ variant, subtitle, title }) => {
	const labelStyle = 'text-zinc-500 text-normal text-sm';

	if (variant === 'form-title') {
		return (
			<div>
				<p className='font-bold text-zinc text-[20px]'>{title}</p>
				<p className={labelStyle}>{subtitle}</p>
			</div>
		);
	}

	if (variant === 'sub-header') {
		return (
			<div className='mb-4'>
				<p className='font-inter font-semibold text-base'>{title}</p>
				<p className={labelStyle}>{subtitle}</p>
			</div>
		);
	}

	if (variant === 'form-component-title') {
		return (
			<div className='mb-4'>
				<p className='text-sm text-zinc-950 font-medium font-inter mb-2'>{title}</p>
				<p className={labelStyle}>{subtitle}</p>
			</div>
		);
	}

	return <div></div>;
};

export default FormTitle;
