import React, { FC } from 'react';

interface Props {
	title?: string;
	subtitle?: string;
	variant: 'main-header' | 'sub-header' | 'form-title';
}

const FormTitle: FC<Props> = ({ variant, subtitle, title }) => {
	const labelStyle = 'text-muted-foreground text-sm';

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

	return <div></div>;
};

export default FormTitle;
