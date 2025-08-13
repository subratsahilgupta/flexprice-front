import { FC, useState, useEffect } from 'react';
import { Button, Input, Sheet, Spacer } from '@/components/atoms';
import { useUser } from '@/hooks/UserContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useMutation } from '@tanstack/react-query';
import ConnectionApi from '@/api/ConnectionApi';
import toast from 'react-hot-toast';
import { Copy, CheckCircle } from 'lucide-react';

interface StripeConnectionDrawerProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	connection?: any; // for editing
	onSave: (connection: any) => void;
}

interface StripeFormData {
	name: string;
	account_id: string;
	publishable_key: string;
	secret_key: string;
	webhook_secret: string;
}

const StripeConnectionDrawer: FC<StripeConnectionDrawerProps> = ({ isOpen, onOpenChange, connection, onSave }) => {
	const { user } = useUser();
	const { activeEnvironment } = useEnvironment();

	const [formData, setFormData] = useState<StripeFormData>({
		name: '',
		account_id: '',
		publishable_key: '',
		secret_key: '',
		webhook_secret: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [webhookCopied, setWebhookCopied] = useState(false);

	// Generate webhook URL using environment variable
	const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';
	const webhookUrl = user?.tenant?.id && activeEnvironment?.id ? `${apiUrl}/webhooks/stripe/${user.tenant.id}/${activeEnvironment.id}` : '';

	// Reset form on open or when editing connection changes
	useEffect(() => {
		if (isOpen) {
			if (connection) {
				setFormData({
					name: connection.name || '',
					account_id: connection.account_id || '',
					publishable_key: connection.publishable_key || '',
					secret_key: connection.secret_key || '',
					webhook_secret: connection.webhook_secret || '',
				});
			} else {
				setFormData({
					name: '',
					account_id: '',
					publishable_key: '',
					secret_key: '',
					webhook_secret: '',
				});
			}
			setErrors({});
			setWebhookCopied(false);
		}
	}, [isOpen, connection]);

	const handleChange = (field: keyof StripeFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: '' }));
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Connection name is required';
		}
		if (!formData.publishable_key.trim()) {
			newErrors.publishable_key = 'Publishable key is required';
		}
		if (!formData.secret_key.trim()) {
			newErrors.secret_key = 'Secret key is required';
		}
		if (!formData.webhook_secret.trim()) {
			newErrors.webhook_secret = 'Webhook secret is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const { mutate: createConnection, isPending } = useMutation({
		mutationFn: async () => {
			const payload = {
				name: formData.name,
				provider_type: 'stripe',
				encrypted_secret_data: {
					account_id: formData.account_id,
					publishable_key: formData.publishable_key,
					secret_key: formData.secret_key,
					webhook_secret: formData.webhook_secret,
				},
			};

			return await ConnectionApi.createConnection(payload);
		},
		onSuccess: (response) => {
			toast.success('Stripe connection created successfully');
			onSave(response);
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Failed to create connection');
		},
	});

	const handleSave = () => {
		if (validateForm()) {
			createConnection();
		}
	};

	const handleCopyWebhookUrl = () => {
		if (webhookUrl) {
			navigator.clipboard.writeText(webhookUrl);
			setWebhookCopied(true);
			toast.success('Webhook URL copied to clipboard!');

			// Reset copy status after 2 seconds
			setTimeout(() => {
				setWebhookCopied(false);
			}, 2000);
		}
	};

	return (
		<Sheet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title={connection ? 'Edit Stripe Connection' : 'Connect to Stripe'}
			description='Configure your Stripe integration with the required credentials.'
			size='lg'>
			<div className='space-y-4 mt-4'>
				{/* Webhook URL Section */}
				<div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
					<h3 className='text-sm font-medium text-blue-800 mb-2'>Webhook Configuration</h3>
					<p className='text-xs text-blue-700 mb-3'>Set up this webhook URL in your Stripe dashboard to receive event notifications:</p>
					<div className='flex items-center gap-2 p-2 bg-white border border-blue-200 rounded-md'>
						<code className='flex-1 text-xs text-gray-800 font-mono break-all'>{webhookUrl}</code>
						<Button size='xs' variant='outline' onClick={handleCopyWebhookUrl} className='flex items-center gap-1'>
							{webhookCopied ? <CheckCircle className='w-3 h-3' /> : <Copy className='w-3 h-3' />}
							{webhookCopied ? 'Copied!' : 'Copy'}
						</Button>
					</div>
					<p className='text-xs text-blue-600 mt-2'>
						After setting up the webhook in Stripe, you'll receive a webhook secret which you can enter below.
					</p>
				</div>

				<Input
					label='Connection Name'
					placeholder='e.g., Production Stripe, Test Stripe'
					value={formData.name}
					onChange={(value) => handleChange('name', value)}
					error={errors.name}
					description='A friendly name to identify this Stripe connection'
				/>

				<Input
					label='Account ID (Optional)'
					placeholder='acct_1234567890'
					value={formData.account_id}
					onChange={(value) => handleChange('account_id', value)}
					error={errors.account_id}
					description='Your Stripe account ID (optional for direct integrations)'
				/>

				<Input
					label='Publishable Key'
					placeholder='pk_...'
					type='password'
					value={formData.publishable_key}
					onChange={(value) => handleChange('publishable_key', value)}
					error={errors.publishable_key}
					description='Your Stripe publishable key from the API keys section'
				/>

				<Input
					label='Secret Key'
					placeholder='sk_...'
					type='password'
					value={formData.secret_key}
					onChange={(value) => handleChange('secret_key', value)}
					error={errors.secret_key}
					description='Your Stripe secret key from the API keys section'
				/>

				<Input
					label='Webhook Secret'
					placeholder='whsec_...'
					type='password'
					value={formData.webhook_secret}
					onChange={(value) => handleChange('webhook_secret', value)}
					error={errors.webhook_secret}
					description='The webhook secret provided by Stripe after setting up the webhook endpoint'
				/>

				<Spacer className='!h-4' />

				<div className='flex gap-2'>
					<Button variant='outline' onClick={() => onOpenChange(false)} className='flex-1' disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={handleSave} className='flex-1' isLoading={isPending} disabled={isPending}>
						{connection ? 'Update' : 'Save Connection'}
					</Button>
				</div>
			</div>
		</Sheet>
	);
};

export default StripeConnectionDrawer;
