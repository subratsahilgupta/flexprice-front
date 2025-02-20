import { FormHeader } from '@/components/atoms';
import React, { FC } from 'react';

export interface Detail {
	label?: string;
	value?: React.ReactNode;
	variant?: 'default' | 'divider' | 'heading';
	className?: string;
}

interface Props {
	title?: string;
	titleClassName?: string;
	description?: string;
	variant?: 'default' | 'left-aligned';
	data: Detail[];
	className?: string;
}

const DetailsCard: FC<Props> = ({ title, description, data, variant = 'default', titleClassName, className }) => {
	return (
		<div className={`card bg-white ${className}`}>
			{title && <FormHeader subtitle={description} title={title} variant='sub-header' titleClassName={titleClassName} />}
			<div className='flex items-center space-x-4'>
				<div className='w-full space-y-4'>
					{data.map((detail, index) => {
						if (detail.variant === 'heading') {
							return <FormHeader key={index} titleClassName={detail.className} title={detail.label} variant='form-component-title' />;
						}

						if (detail.variant === 'divider') {
							return <div key={index} className={`w-full h-[1px] bg-gray-200 ${detail.className}`} />;
						}

						return (
							<div key={index} className={`grid grid-cols-2 gap-4 ${detail.className}`}>
								<div className='text-sm font-light text-gray-600'>{detail.label}</div>
								<div className={`text-sm font-normal text-gray-800 ${variant === 'left-aligned' ? 'text-left' : 'text-right'}`}>
									{detail.value || '--'}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default DetailsCard;
