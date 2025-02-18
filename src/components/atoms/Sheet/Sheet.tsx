import { FC, ReactNode } from 'react';
import { Sheet as ShadcnSheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Props {
	trigger?: ReactNode;
	children?: ReactNode;
	title?: string | ReactNode;
	description?: string | ReactNode;
	isOpen?: boolean;
	onOpenChange?: (isOpen: boolean) => void;
}

const Sheet: FC<Props> = ({ children, trigger, description, title, isOpen, onOpenChange }) => {
	return (
		<ShadcnSheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent className='h-screen overflow-y-auto'>
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>
				{children}
			</SheetContent>
		</ShadcnSheet>
	);
};

export default Sheet;
