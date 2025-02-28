import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface ModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	children?: ReactNode;
	className?: string;
}

const Modal: FC<ModalProps> = ({ isOpen, onOpenChange, children, className }) => {
	if (!isOpen) return null; // Don't render if modal is closed

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30' onClick={() => onOpenChange(false)}>
			<div className={cn(className)} onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
};

export default Modal;
