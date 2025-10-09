import { FC, useState, useEffect } from 'react';
import { Button, Input, Sheet, Spacer } from '@/components/atoms';
import { Switch } from '@/components/ui/switch';
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
	secret_key: string;
	webhook_secret: string;
	sync_config: {
		plan: {
			inbound: boolean;
			outbound: boolean;
		};
		subscription: {
			inbound: boolean;
			outbound: boolean;
		};
		invoice: {
			inbound: boolean;
			outbound: boolean;
		};
	};
}

const StripeConnectionDrawer: FC<StripeConnectionDrawerProps> = ({ isOpen, onOpenChange, connection, onSave }) => {
	const { user } = useUser();
	const { activeEnvironment } = useEnvironment();

	const [formData, setFormData] = useState<StripeFormData>({
		name: '',
		secret_key: '',
		webhook_secret: '',
		sync_config: {
			plan: {
				inbound: false,
				outbound: false,
			},
			subscription: {
				inbound: false,
				outbound: false,
			},
			invoice: {
				inbound: false,
				outbound: false,
			},
		},
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [webhookCopied, setWebhookCopied] = useState(false);

	// Generate webhook URL using environment variable
	const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';
	const webhookUrl = user?.tenant?.id && activeEnvironment?.id ? `${apiUrl}/webhooks/stripe/${user.tenant.id}/${activeEnvironment.id}` : '';

	// Webhook events mapping based on sync config
	const getWebhookEvents = () => {
		const events: string[] = [];

		// Default events (always included)
		events.push('payment_intent.succeeded', 'payment_intent.payment_failed', 'customer.created', 'customer.updated', 'customer.deleted');

		// Plan events
		if (formData.sync_config.plan.inbound) {
			events.push('product.created', 'product.updated', 'product.deleted');
		}

		// Subscription events
		if (formData.sync_config.subscription.inbound) {
			events.push('customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted');
		}

		// Invoice events
		if (formData.sync_config.invoice.outbound) {
			events.push('invoice.created', 'invoice.sent', 'invoice.payment_succeeded', 'invoice.payment_failed');
		}

		return events;
	};

	// Reset form on open or when editing connection changes
	useEffect(() => {
		if (isOpen) {
			if (connection) {
				setFormData({
					name: connection.name || '',
					secret_key: connection.secret_key || '',
					webhook_secret: connection.webhook_secret || '',
					sync_config: connection.sync_config || {
						plan: { inbound: false, outbound: false },
						subscription: { inbound: false, outbound: false },
						invoice: { inbound: false, outbound: false },
					},
				});
			} else {
				setFormData({
					name: '',
					secret_key: '',
					webhook_secret: '',
					sync_config: {
						plan: { inbound: false, outbound: false },
						subscription: { inbound: false, outbound: false },
						invoice: { inbound: false, outbound: false },
					},
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

	const handleSyncConfigChange = (category: keyof typeof formData.sync_config, direction: 'inbound' | 'outbound', value: boolean) => {
		setFormData((prev) => ({
			...prev,
			sync_config: {
				...prev.sync_config,
				[category]: {
					...prev.sync_config[category],
					[direction]: value,
				},
			},
		}));
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Connection name is required';
		}

		// Only validate secrets when creating new connection
		if (!connection) {
			if (!formData.secret_key.trim()) {
				newErrors.secret_key = 'Secret key is required';
			}
			if (!formData.webhook_secret.trim()) {
				newErrors.webhook_secret = 'Webhook secret is required';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const { mutate: createConnection, isPending: isCreating } = useMutation({
		mutationFn: async () => {
			const payload = {
				name: formData.name,
				provider_type: 'stripe',
				encrypted_secret_data: {
					secret_key: formData.secret_key,
					webhook_secret: formData.webhook_secret,
				},
				sync_config: formData.sync_config,
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

	const { mutate: updateConnection, isPending: isUpdating } = useMutation({
		mutationFn: async () => {
			const payload = {
				name: formData.name,
				sync_config: formData.sync_config,
			};

			return await ConnectionApi.updateConnection(connection.id, payload);
		},
		onSuccess: (response) => {
			toast.success('Stripe connection updated successfully');
			onSave(response);
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Failed to update connection');
		},
	});

	const handleSave = () => {
		if (validateForm()) {
			if (connection) {
				updateConnection();
			} else {
				createConnection();
			}
		}
	};

	const isPending = isCreating || isUpdating;

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

				{!connection && (
					<>
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
					</>
				)}

				{/* Sync Configuration Section */}
				<div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
					<h3 className='text-sm font-medium text-gray-800 mb-3'>Sync Configuration</h3>
					<p className='text-xs text-gray-600 mb-4'>Configure what data to sync between Stripe and your system</p>

					<div className='space-y-4'>
						{/* Plan Sync */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Plans</label>
							<div className='flex items-center gap-6'>
								<div className='flex items-center gap-3'>
									<Switch
										checked={formData.sync_config.plan.inbound}
										onCheckedChange={(checked) => handleSyncConfigChange('plan', 'inbound', checked)}
									/>
									<label className='text-sm text-gray-700'>Inbound</label>
								</div>
								<div className='flex items-center gap-3 opacity-50'>
									<Switch disabled />
									<label className='text-sm text-gray-500'>Outbound - Disabled</label>
								</div>
							</div>
						</div>

						{/* Subscription Sync */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Subscriptions</label>
							<div className='flex items-center gap-6'>
								<div className='flex items-center gap-3'>
									<Switch
										checked={formData.sync_config.subscription.inbound}
										onCheckedChange={(checked) => handleSyncConfigChange('subscription', 'inbound', checked)}
									/>
									<label className='text-sm text-gray-700'>Inbound</label>
								</div>
								<div className='flex items-center gap-3 opacity-50'>
									<Switch disabled />
									<label className='text-sm text-gray-500'>Outbound - Disabled</label>
								</div>
							</div>
						</div>

						{/* Invoice Sync */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Invoices</label>
							<div className='flex items-center gap-6'>
								<div className='flex items-center gap-3 opacity-50'>
									<Switch disabled />
									<label className='text-sm text-gray-500'>Inbound - Disabled</label>
								</div>
								<div className='flex items-center gap-3'>
									<Switch
										checked={formData.sync_config.invoice.outbound}
										onCheckedChange={(checked) => handleSyncConfigChange('invoice', 'outbound', checked)}
									/>
									<label className='text-sm text-gray-700'>Outbound</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Webhook Events List */}
				<div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
					<h3 className='text-sm font-medium text-green-800 mb-2'>Webhook Events to Subscribe</h3>
					<p className='text-xs text-green-700 mb-3'>
						Based on your sync configuration, subscribe to these events in your Stripe dashboard:
					</p>
					<div className='space-y-1'>
						{getWebhookEvents().map((event, index) => (
							<div key={index} className='flex items-center gap-2 text-xs text-green-700'>
								<div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
								<code className='font-mono'>{event}</code>
							</div>
						))}
					</div>
				</div>

				<Spacer className='!h-4' />

				<div className='flex gap-2'>
					<Button variant='outline' onClick={() => onOpenChange(false)} className='flex-1' disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={handleSave} className='flex-1' isLoading={isPending} disabled={isPending}>
						{connection ? 'Update Connection' : 'Create Connection'}
					</Button>
				</div>
			</div>
		</Sheet>
	);
};

export default StripeConnectionDrawer;
