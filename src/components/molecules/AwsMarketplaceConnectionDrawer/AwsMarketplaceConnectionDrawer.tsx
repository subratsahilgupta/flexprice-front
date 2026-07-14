import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Highlight, themes } from 'prism-react-renderer';
import { ChevronDown, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Sheet, Spacer } from '@/components/atoms';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ConnectionApi from '@/api/ConnectionApi';
import { CONNECTION_PROVIDER_TYPE } from '@/models';
import { CreateConnectionPayload } from '@/types/dto';
import { config } from '@/config/config';
import { copyToClipboard } from '@/utils/common/helper_functions';
import { cn } from '@/lib/utils';

interface AwsMarketplaceConnectionDrawerProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	connection?: any; // for editing
	onSave: (connection: any) => void;
}

interface FormData {
	name: string;
	role_arn: string;
}

interface ValidationErrors {
	name?: string;
	role_arn?: string;
}

// arn:aws:iam::<12-digit-account>:role/<name>
const ROLE_ARN_REGEX = /^arn:aws:iam::\d{12}:role\/.+$/;

/** A fresh, unique external ID per connection attempt — guards the confused-deputy risk on AssumeRole. */
const generateExternalId = (): string => {
	const rand =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
	return `flexprice-mp-${rand}`;
};

/** IAM permission policy — identical for every tenant. `BatchMeterUsage` is not resource-scopable. */
const buildIamPolicy = () => ({
	Version: '2012-10-17',
	Statement: [{ Effect: 'Allow', Action: 'aws-marketplace:BatchMeterUsage', Resource: '*' }],
});

/** Trust policy — grants Flexprice's AWS account permission to assume the role, scoped to `externalId`. */
const buildTrustPolicy = (flexpriceAwsAccountId: string, externalId: string) => ({
	Version: '2012-10-17',
	Statement: [
		{
			Effect: 'Allow',
			Principal: { AWS: `arn:aws:iam::${flexpriceAwsAccountId}:root` },
			Action: 'sts:AssumeRole',
			Condition: { StringEquals: { 'sts:ExternalId': externalId } },
		},
	],
});

/** Collapsed-by-default JSON viewer with a copy control that works without expanding. */
const PolicyBlock: FC<{ label: string; json: unknown; copyToast: string }> = ({ label, json, copyToast }) => {
	const { t: tc } = useTranslation('common');
	const [open, setOpen] = useState(false);
	const text = useMemo(() => JSON.stringify(json, null, 2), [json]);

	return (
		<Collapsible open={open} onOpenChange={setOpen} className='rounded-lg border border-gray-200 overflow-hidden'>
			<div className='flex items-center justify-between bg-gray-50 px-4 py-2'>
				<CollapsibleTrigger asChild>
					<button type='button' className='flex items-center gap-2 text-sm font-medium text-foreground'>
						<ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
						{label}
					</button>
				</CollapsibleTrigger>
				<Button type='button' variant='ghost' size='sm' className='h-7' onClick={() => copyToClipboard(text, copyToast)}>
					<Copy size={12} className='me-1' />
					<span className='text-xs'>{tc('actions.copy')}</span>
				</Button>
			</div>
			<CollapsibleContent>
				<Highlight theme={themes.nightOwl} code={text} language='json'>
					{({ className, style, tokens, getLineProps, getTokenProps }) => (
						<pre className={cn(className, 'p-4 overflow-x-auto')} style={style}>
							{tokens.map((line, i) => (
								<div key={i} {...getLineProps({ line })}>
									{line.map((token, key) => (
										<span key={key} {...getTokenProps({ token })} className='text-sm font-normal font-fira-code' />
									))}
								</div>
							))}
						</pre>
					)}
				</Highlight>
			</CollapsibleContent>
		</Collapsible>
	);
};

const AwsMarketplaceConnectionDrawer: FC<AwsMarketplaceConnectionDrawerProps> = ({ isOpen, onOpenChange, connection, onSave }) => {
	const { t } = useTranslation('settings');
	const { t: tc } = useTranslation('common');
	const isEditMode = !!connection;

	const [formData, setFormData] = useState<FormData>({ name: '', role_arn: '' });
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [externalId, setExternalId] = useState<string>('');

	const flexpriceAwsAccountId = config.integrations.flexpriceAwsAccountId;

	// Reset form and mint a fresh external ID each time the drawer opens for a new connection.
	useEffect(() => {
		if (!isOpen) return;
		if (connection) {
			setFormData({ name: connection.name || '', role_arn: '' });
			setExternalId('');
		} else {
			setFormData({ name: '', role_arn: '' });
			setExternalId(generateExternalId());
		}
		setErrors({});
	}, [connection, isOpen]);

	const iamPolicy = useMemo(() => buildIamPolicy(), []);
	const trustPolicy = useMemo(
		() => buildTrustPolicy(flexpriceAwsAccountId || '{FLEXPRICE_AWS_ACCOUNT_ID}', externalId || '{EXTERNAL_ID}'),
		[flexpriceAwsAccountId, externalId],
	);

	const handleChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
	};

	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};
		if (!formData.name.trim()) {
			newErrors.name = t('connection.validation.nameRequired');
		}
		if (!isEditMode) {
			if (!formData.role_arn.trim()) {
				newErrors.role_arn = t('connection.validation.roleArnRequired');
			} else if (!ROLE_ARN_REGEX.test(formData.role_arn.trim())) {
				newErrors.role_arn = t('connection.validation.roleArnInvalid');
			}
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const { mutate: createConnection, isPending: isCreating } = useMutation({
		mutationFn: async () => {
			const payload: CreateConnectionPayload = {
				name: formData.name.trim(),
				provider_type: CONNECTION_PROVIDER_TYPE.AWS_MARKETPLACE,
				encrypted_secret_data: {
					role_arn: formData.role_arn.trim(),
					external_id: externalId,
				},
			};
			// Backend performs a live STS AssumeRole with this role_arn + external_id and only persists
			// on success; a failure surfaces here as the AWS error verbatim (HTTP 422).
			return await ConnectionApi.Create(payload);
		},
		onSuccess: (response) => {
			toast.success(t('connection.toast.created', { provider: 'AWS Marketplace' }));
			onSave(response);
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || t('connection.toast.failedToCreate'));
		},
	});

	const { mutate: updateConnection, isPending: isUpdating } = useMutation({
		mutationFn: async () => ConnectionApi.Update(connection.id, { name: formData.name.trim() }),
		onSuccess: (response) => {
			toast.success(t('connection.toast.updated', { provider: 'AWS Marketplace' }));
			onSave(response);
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || t('connection.toast.failedToUpdate'));
		},
	});

	const handleSave = () => {
		if (!validateForm()) return;
		if (isEditMode) {
			updateConnection();
		} else {
			createConnection();
		}
	};

	const isPending = isCreating || isUpdating;

	return (
		<Sheet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title={isEditMode ? t('connection.awsMarketplace.titleEdit') : t('connection.awsMarketplace.titleConnect')}
			description={t('connection.awsMarketplace.description')}
			size='lg'>
			<div className='space-y-6 mt-9'>
				<Input
					label={t('connection.awsMarketplace.connectionNameLabel')}
					placeholder={t('connection.awsMarketplace.connectionNamePlaceholder')}
					value={formData.name}
					onChange={(value) => handleChange('name', value)}
					error={errors.name}
					description={t('connection.awsMarketplace.connectionNameHint')}
				/>

				{!isEditMode && (
					<>
						{/* Step 1 — policies to paste into the tenant's own AWS account */}
						<div className='space-y-3'>
							<div>
								<p className='text-sm font-medium text-foreground'>{t('connection.awsMarketplace.step1Title')}</p>
								<p className='text-xs text-gray-500 mt-1'>{t('connection.awsMarketplace.step1Hint')}</p>
							</div>

							<PolicyBlock
								label={t('connection.awsMarketplace.iamPolicyLabel')}
								json={iamPolicy}
								copyToast={t('connection.awsMarketplace.copyIamPolicy')}
							/>

							{!flexpriceAwsAccountId && <p className='text-xs text-amber-600'>{t('connection.awsMarketplace.accountIdMissing')}</p>}

							<PolicyBlock
								label={t('connection.awsMarketplace.trustPolicyLabel')}
								json={trustPolicy}
								copyToast={t('connection.awsMarketplace.copyTrustPolicy')}
							/>

							{/* External ID (read-only) — already embedded in the trust policy, shown for reference */}
							<div className='rounded-lg border border-gray-200 p-3'>
								<div className='flex items-center justify-between gap-2'>
									<div className='min-w-0'>
										<p className='text-xs font-medium text-foreground'>{t('connection.awsMarketplace.externalIdLabel')}</p>
										<p className='text-sm font-fira-code text-gray-700 break-all'>{externalId}</p>
									</div>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='h-7 shrink-0'
										onClick={() => copyToClipboard(externalId, t('connection.awsMarketplace.copyExternalId'))}>
										<Copy size={12} className='me-1' />
										<span className='text-xs'>{tc('actions.copy')}</span>
									</Button>
								</div>
								<p className='text-xs text-gray-500 mt-2'>{t('connection.awsMarketplace.externalIdHint')}</p>
							</div>
						</div>

						{/* Step 2 — the Role ARN the tenant gets back from AWS */}
						<div className='space-y-3'>
							<p className='text-sm font-medium text-foreground'>{t('connection.awsMarketplace.step2Title')}</p>
							<Input
								label={t('connection.awsMarketplace.roleArnLabel')}
								placeholder={t('connection.awsMarketplace.roleArnPlaceholder')}
								value={formData.role_arn}
								onChange={(value) => handleChange('role_arn', value)}
								error={errors.role_arn}
								description={t('connection.awsMarketplace.roleArnHint')}
							/>
						</div>
					</>
				)}

				<Spacer className='!h-1' />
				<div className='flex gap-1'>
					<Button variant='outline' onClick={() => onOpenChange(false)} className='flex-1'>
						{tc('actions.cancel')}
					</Button>
					<Button onClick={handleSave} className='flex-1' isLoading={isPending}>
						{isEditMode ? tc('actions.update') : tc('actions.save')}
					</Button>
				</div>
			</div>
		</Sheet>
	);
};

export default AwsMarketplaceConnectionDrawer;
