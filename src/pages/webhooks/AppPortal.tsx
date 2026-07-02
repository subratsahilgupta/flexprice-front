import { useState } from 'react';
import { useEndpoints, useNewEndpoint, useEndpointFunctions, useEndpointSecret, useSvix } from 'svix-react';
import type { EndpointOut } from 'svix';
import { Button, Input, Loader } from '@/components/atoms';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function EndpointRow({ ep, onDeleted }: { ep: EndpointOut; onDeleted: () => void }) {
	const { t } = useTranslation('developers');
	const { deleteEndpoint } = useEndpointFunctions(ep.id);
	const secret = useEndpointSecret(ep.id);
	const [showSecret, setShowSecret] = useState(false);

	return (
		<li className='flex items-center justify-between gap-4 border-b py-3'>
			<div className='min-w-0'>
				<div className='truncate font-medium'>{ep.url}</div>
				{ep.description && <div className='truncate text-sm text-gray-500'>{ep.description}</div>}
				{showSecret && (
					<div className='mt-1 break-all font-mono text-xs'>
						{secret.loading
							? t('webhooks.appPortal.loadingSecret')
							: secret.error
								? t('webhooks.appPortal.secretLoadFailed')
								: secret.data?.key}
					</div>
				)}
			</div>
			<div className='flex shrink-0 gap-2'>
				<Button
					variant='outline'
					onClick={() => {
						setShowSecret((s) => !s);
						if (!secret.data) secret.reload();
					}}>
					{showSecret ? t('webhooks.appPortal.hideSecret') : t('webhooks.appPortal.revealSecret')}
				</Button>
				<Button
					variant='outline'
					onClick={async () => {
						if (!window.confirm(t('webhooks.appPortal.deleteConfirm', { url: ep.url }))) return;
						try {
							await deleteEndpoint();
							toast.success(t('webhooks.appPortal.deleteSuccess'));
							onDeleted();
						} catch {
							toast.error(t('webhooks.appPortal.deleteFailed'));
						}
					}}>
					{t('webhooks.appPortal.delete')}
				</Button>
			</div>
		</li>
	);
}

export default function AppPortal() {
	const { t } = useTranslation('developers');
	const endpoints = useEndpoints();
	const form = useNewEndpoint();
	const { svix, appId } = useSvix();
	const [submitting, setSubmitting] = useState(false);

	if (endpoints.loading && !endpoints.data) {
		return (
			<div className='flex h-96 items-center justify-center'>
				<Loader />
			</div>
		);
	}
	if (endpoints.error) {
		return <div className='p-4 text-red-600'>{t('webhooks.appPortal.loadFailed')}</div>;
	}

	return (
		<div className='space-y-6'>
			<form
				className='flex items-end gap-3'
				onSubmit={async (e) => {
					e.preventDefault();
					if (!form.url.value) return;
					setSubmitting(true);
					try {
						// ponytail: svix-react's useNewEndpoint always sends filterTypes: [],
						// which Svix rejects as invalid. Build the payload ourselves and omit
						// filterTypes entirely when no event types are selected (v1 has no
						// picker, so this is always "subscribe to all events").
						await svix.endpoint.create(appId, {
							url: form.url.value,
							description: form.description.value || undefined,
							version: 1,
						});
						toast.success(t('webhooks.appPortal.addSuccess'));
						form.url.setValue('');
						form.description.setValue('');
						endpoints.reload();
					} catch {
						toast.error(t('webhooks.appPortal.addFailed'));
					} finally {
						setSubmitting(false);
					}
				}}>
				<Input
					label={t('webhooks.appPortal.urlLabel')}
					placeholder={t('webhooks.appPortal.urlPlaceholder')}
					value={form.url.value}
					onChange={(v: string) => form.url.setValue(v)}
				/>
				<Input
					label={t('webhooks.appPortal.descriptionLabel')}
					placeholder={t('webhooks.appPortal.descriptionPlaceholder')}
					value={form.description.value}
					onChange={(v: string) => form.description.setValue(v)}
				/>
				<Button type='submit' disabled={submitting || !form.url.value}>
					{submitting ? t('webhooks.appPortal.adding') : t('webhooks.appPortal.addEndpoint')}
				</Button>
			</form>

			<ul>
				{endpoints.data?.length ? (
					endpoints.data.map((ep) => <EndpointRow key={ep.id} ep={ep} onDeleted={endpoints.reload} />)
				) : (
					<li className='py-6 text-center text-gray-500'>{t('webhooks.appPortal.empty')}</li>
				)}
			</ul>

			{(endpoints.hasPrevPage || endpoints.hasNextPage) && (
				<div className='flex gap-2'>
					<Button variant='outline' disabled={!endpoints.hasPrevPage} onClick={endpoints.prevPage}>
						{t('webhooks.appPortal.previous')}
					</Button>
					<Button variant='outline' disabled={!endpoints.hasNextPage} onClick={endpoints.nextPage}>
						{t('webhooks.appPortal.next')}
					</Button>
				</div>
			)}
		</div>
	);
}
