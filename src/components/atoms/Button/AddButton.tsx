import { Plus } from 'lucide-react';
import Button, { ButtonProps } from './Button';
import { cn } from '@/lib/utils';

interface AddButtonProps extends Omit<ButtonProps, 'prefixIcon'> {
	/**
	 * Custom label text. Defaults to "Add"
	 */
	label?: string;
}

/**
 * A standardized Add button component with a plus icon
 * Built on top of the base Button component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AddButton onClick={handleAdd} />
 *
 * // Custom label
 * <AddButton label="Add User" onClick={handleAddUser} />
 *
 * // With custom styling
 * <AddButton label="Add Item" variant="secondary" className="my-4" />
 * ```
 */
const AddButton = ({ label = 'Add', className, children, ...props }: AddButtonProps) => {
	return (
		<Button prefixIcon={<Plus />} className={cn('gap-1', className)} {...props}>
			{children || label}
		</Button>
	);
};

export default AddButton;
