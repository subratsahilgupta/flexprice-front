import { Dialog as ShadcnDialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FC, ReactNode } from 'react';

interface Props {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	title: string;
	description?: string;
	children?: ReactNode;
}

const Dialog: FC<Props> = ({ isOpen, onOpenChange, title, description, children }) => {
	return (
		<ShadcnDialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className='bg-white'>
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
