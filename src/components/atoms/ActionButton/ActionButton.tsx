import { BsThreeDots } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Dialog } from '@/components/atoms';
import { EyeOff, Pencil } from 'lucide-react';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';

interface ActionProps {
	id: string;
	editPath: string;
	deleteMutationFn: (id: string) => Promise<void>;
	refetchQueryKey: string;
	entityName: string;
	row?: any;
	isArchiveDisabled?: boolean;
	isEditDisabled?: boolean;
	onEdit?: () => void;
}

const ActionButton: FC<ActionProps> = ({
	id,
	editPath,
	onEdit,
	deleteMutationFn,
	refetchQueryKey,
	entityName,
	isArchiveDisabled,
	isEditDisabled,
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const { mutate: deleteEntity } = useMutation({
		mutationFn: deleteMutationFn,
		onSuccess: async () => {
			toast.success(`${entityName} deleted successfully`);
			await refetchQueries(refetchQueryKey);
		},
		onError: () => {
			toast.error(`Failed to delete ${entityName}`);
		},
	});

	const handleClick = (e: React.MouseEvent) => {
		// Prevent event from bubbling up to parent elements
		e.preventDefault();
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	return (
		<>
			<div data-interactive='true' onClick={handleClick}>
				<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
					<DropdownMenuTrigger asChild>
						<button>
							<BsThreeDots className='text-base size-4' />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem
							disabled={isEditDisabled}
							onSelect={(event) => {
								event.preventDefault();
								setIsOpen(false);
								if (onEdit) {
									onEdit();
								} else {
									navigate(editPath);
								}
							}}
							className='flex gap-2 items-center w-full cursor-pointer'>
							<Pencil />
							<span>Edit</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={isArchiveDisabled}
							onSelect={(event) => {
								event.preventDefault();
								setIsOpen(false);
								setIsDialogOpen(true);
							}}
							className='flex gap-2 items-center w-full cursor-pointer'>
							<EyeOff />
							<span>Archive</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Dialog title={`Are you sure you want to archive this ${entityName}?`} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<div className='flex flex-col mt-4 gap-4 items-end justify-center'>
					<div className='flex gap-4'>
						<Button variant='outline' onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setIsDialogOpen(false);
								deleteEntity(id);
							}}>
							Archive
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ActionButton;
