import { Dialog as ShadcnDialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface Props {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	title: string;
	description?: string;
	children?: ReactNode;
	className?: string;
}

const Dialog: FC<Props> = ({ className, isOpen, onOpenChange, title, description, children }) => {
	return (
		<ShadcnDialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className={cn('bg-white', className)}>
				<DialogHeader>
					<DialogTitle className='font-medium'>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children}
			</DialogContent>
		</ShadcnDialog>
	);
};

export default Dialog;
