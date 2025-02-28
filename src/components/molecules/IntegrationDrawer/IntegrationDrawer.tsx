import { FC, useState, useEffect } from 'react';
import { Button, Input, Sheet, Spacer } from '@/components/atoms';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import IntegrationsApi from '@/utils/api_requests/IntegrationsApi';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';
import { LoaderCircleIcon } from 'lucide-react';

interface IntegrationDrawerProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	provider: string;
	providerName: string;
}

const IntegrationDrawer: FC<IntegrationDrawerProps> = ({ isOpen, onOpenChange, provider, providerName }) => {
	const [formData, setFormData] = useState({
		name: '',
		apiKey: '',
		connectionCode: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form on open
	useEffect(() => {
		if (isOpen) {
			setFormData({
				name: '',
				apiKey: '',
				connectionCode: '',
			});
			setErrors({});
		}
	}, [isOpen]);

	// Query to check if integration exists
	const { data: existingIntegration, isLoading: isCheckingIntegration } = useQuery({
		queryKey: ['integration', provider],
		queryFn: async () => {
			try {
				const response = await IntegrationsApi.getIntegration(provider);
				// The API likely returns the Integration directly
				return response;
			} catch (error) {
				return null;
			}
		},
		enabled: isOpen,
	});

	// Mutation for installing integration
	const { mutate: installIntegration, isPending: isInstalling } = useMutation({
		mutationFn: async () => {
			return await IntegrationsApi.installIntegration({
				provider,
				credentials: {
					key: formData.apiKey,
				},
				name: formData.name,
			});
		},
		onSuccess: () => {
			toast.success(`${providerName} integration installed successfully`);
			refetchQueries(['integration', provider]);
			onOpenChange(false);
		},
		onError: (error) => {
			console.error(error);
			toast.error(`Failed to install ${providerName} integration`);
		},
	});

	const handleChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: '' }));
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Connection name is required';
		}

		if (!formData.apiKey.trim()) {
			newErrors.apiKey = 'API secret key is required';
		}

		if (!formData.connectionCode.trim()) {
			newErrors.connectionCode = 'Connection code is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInstall = () => {
		if (validateForm()) {
			installIntegration();
		}
	};

	// const isLoading = isCheckingIntegration || isInstalling;
	const hasIntegration = !!existingIntegration;

	return (
		<Sheet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title={`Connect to ${providerName}`}
			description="Make changes to your profile here. Click save when you're done.">
			<div className='space-y-4 mt-4'>
				{isCheckingIntegration ? (
					<div className='flex justify-center py-4'>
						<LoaderCircleIcon className='animate-spin h-6 w-6' />
					</div>
				) : hasIntegration ? (
					<div className='space-y-4'>
						<div className='card p-4'>
							<h3 className='font-medium mb-2'>Integration Details</h3>
							<div className='space-y-2'>
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>Name</span>
									<span className='text-sm'>{existingIntegration?.name}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>Status</span>
									<span className='text-sm'>{existingIntegration?.status}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>Created</span>
									<span className='text-sm'>
										{existingIntegration?.created_at && new Date(existingIntegration.created_at).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
						<Button variant='outline' onClick={() => onOpenChange(false)} className='w-full'>
							Close
						</Button>
					</div>
				) : (
					<>
						<Input
							label='Connection Name'
							placeholder='Enter Name'
							value={formData.name}
							onChange={(value) => handleChange('name', value)}
							error={errors.name}
						/>
						<p className='text-sm text-muted-foreground -mt-2'>The values get reset in the given interval</p>

						<Input
							label='Connection Code'
							placeholder='Enter Connection Code'
							value={formData.connectionCode}
							onChange={(value) => handleChange('connectionCode', value)}
							error={errors.connectionCode}
						/>
						<p className='text-sm text-muted-foreground -mt-2'>The values get reset in the given interval</p>

						<Input
							label='API Secret Key'
							placeholder='Enter API Secret Key'
							type='password'
							value={formData.apiKey}
							onChange={(value) => handleChange('apiKey', value)}
							error={errors.apiKey}
						/>
						<p className='text-sm text-muted-foreground -mt-2'>The values get reset in the given interval</p>

						<Spacer className='!h-4' />

						<Button isLoading={isInstalling} disabled={isInstalling} onClick={handleInstall} className='w-full'>
							Install
						</Button>
					</>
				)}
			</div>
		</Sheet>
	);
};

export default IntegrationDrawer;
