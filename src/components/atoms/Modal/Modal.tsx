import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface ModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	children?: ReactNode;
	className?: string;
	showOverlay?: boolean;
}

const Modal: FC<ModalProps> = ({ isOpen, onOpenChange, children, className, showOverlay = true }) => {
	if (!isOpen) return null; // Don't render if modal is closed

	return (
		<div
			className={cn(
				'fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center',
				showOverlay ? 'bg-black bg-opacity-30' : 'bg-transparent',
			)}
			onClick={() => onOpenChange(false)}>
			<div className={cn(className)} onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
};

export default Modal;
