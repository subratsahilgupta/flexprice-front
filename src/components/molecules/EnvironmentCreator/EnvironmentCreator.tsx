import React, { useState } from 'react';
import { Dialog, Input, Select, Button } from '@/components/atoms';
import { ENVIRONMENT_TYPE } from '@/models/Environment';
import { CreateEnvironmentPayload } from '@/types/dto/Environment';
import EnvironmentApi from '@/api/EnvironmentApi';
import toast from 'react-hot-toast';

interface Props {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onEnvironmentCreated?: () => void;
}

const EnvironmentCreator: React.FC<Props> = ({ isOpen, onOpenChange, onEnvironmentCreated }) => {
	const [name, setName] = useState('');
	const [type, setType] = useState<ENVIRONMENT_TYPE>(ENVIRONMENT_TYPE.DEVELOPMENT);
	const [isCreating, setIsCreating] = useState(false);

	const environmentTypeOptions = [
		{
			value: ENVIRONMENT_TYPE.DEVELOPMENT,
			label: 'Development',
			description: 'For development and testing purposes',
		},
		{
			value: ENVIRONMENT_TYPE.PRODUCTION,
			label: 'Production',
			description: 'For live production environment',
		},
	];

	const handleCreate = async () => {
		if (!name.trim()) {
			toast.error('Environment name is required');
			return;
		}

		setIsCreating(true);
		try {
			const payload: CreateEnvironmentPayload = {
				name: name.trim(),
				type,
			};

			const result = await EnvironmentApi.createEnvironment(payload);

			if (result) {
				toast.success('Environment created successfully');
				setName('');
				setType(ENVIRONMENT_TYPE.DEVELOPMENT);
				onOpenChange(false);
				onEnvironmentCreated?.();
			} else {
				toast.error('Failed to create environment');
			}
		} catch {
			toast.error('Failed to create environment');
		} finally {
			setIsCreating(false);
		}
	};

	const handleCancel = () => {
		setName('');
		setType(ENVIRONMENT_TYPE.DEVELOPMENT);
		onOpenChange(false);
	};

	return (
		<Dialog
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title='Create New Environment'
			description='Create a new environment for your application'>
			<div className='space-y-4'>
				<Input label='Environment Name' placeholder='Enter environment name' value={name} onChange={setName} disabled={isCreating} />

				<Select
					label='Environment Type'
					placeholder='Select environment type'
					options={environmentTypeOptions}
					value={type}
					onChange={(value) => setType(value as ENVIRONMENT_TYPE)}
					disabled={isCreating}
				/>

				<div className='flex justify-end space-x-2 pt-4'>
					<Button variant='outline' onClick={handleCancel} disabled={isCreating}>
						Cancel
					</Button>
					<Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
						{isCreating ? 'Creating...' : 'Create Environment'}
					</Button>
				</div>
			</div>
		</Dialog>
	);
};

export default EnvironmentCreator;
