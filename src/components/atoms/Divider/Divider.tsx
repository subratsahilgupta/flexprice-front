import { FC } from 'react';

interface DividerProps {
	color?: string;
	width?: string;
	alignment?: 'left' | 'center' | 'right';
	className?: string;
}

const Divider: FC<DividerProps> = ({ color = '#E4E4E7', width = '100%', alignment = 'center', className }) => {
	const alignmentClass = alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center';

	return (
		<div className={`flex ${alignmentClass} ${className}`}>
			<div
				className='h-px'
				style={{
					backgroundColor: color,
					width: width,
				}}></div>
		</div>
	);
};

export default Divider;
