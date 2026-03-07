import { Loader, Page } from '@/components/atoms';
import { ApiDocsContent } from '@/components/molecules';
import WebhookApi from '@/api/WebhookApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AppPortal } from 'svix-react';
import { EmptyPage } from '@/components/organisms';
import { useMemo, useEffect } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';

/**
 * Webhook dashboard embeds the Svix App Portal. The backend must return a dashboard URL
 * scoped to the current tenant + environment (via X-Environment-ID) so that endpoints
 * are created only in the {tenant}_{environment} Svix app, not in other apps.
 */
const WebhookDashboard = () => {
	const queryClient = useQueryClient();
	const { activeEnvironment, isLoading: envLoading, isError: envError } = useEnvironment();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['webhookDashboardUrl', activeEnvironment?.id],
		queryFn: async () => {
			const envId = activeEnvironment?.id;
			if (!envId) throw new Error('No environment selected');
			return WebhookApi.getWebhookDashboardUrl(envId);
		},
		// Only fetch when environment has settled and one is selected; request is bound to that env via explicit header
		enabled: !envLoading && !envError && !!activeEnvironment?.id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	// Preload the dashboard URL when component mounts and environment is set
	useEffect(() => {
		const envId = activeEnvironment?.id;
		if (envId && !queryClient.getQueryData(['webhookDashboardUrl', envId])) {
			queryClient.prefetchQuery({
				queryKey: ['webhookDashboardUrl', envId],
				queryFn: () => WebhookApi.getWebhookDashboardUrl(envId),
				staleTime: 5 * 60 * 1000,
			});
		}
	}, [queryClient, activeEnvironment?.id]);

	// Memoize the AppPortal props to prevent unnecessary re-renders
	const appPortalProps = useMemo(
		() => ({
			primaryColor: '#000000',
			style: {
				width: '100%',
				height: '100%',
				color: '#000000',
				border: 'none',
				backgroundColor: '#000000',
			},
			url: data?.url ?? '',
		}),
		[data?.url],
	);

	// Wait for useEnvironment() to settle before showing env-dependent UI
	if (envLoading) {
		return (
			<Page className='h-full w-full' heading='Webhooks'>
				<ApiDocsContent tags={['Webhooks']} />
				<div className='flex items-center justify-center h-96'>
					<Loader />
				</div>
			</Page>
		);
	}

	if (envError) {
		return (
			<Page className='h-full w-full' heading='Webhooks'>
				<ApiDocsContent tags={['Webhooks']} />
				<EmptyPage
					heading='Webhooks'
					emptyStateCard={{
						heading: 'Unable to Load Environments',
						description: 'Environments could not be loaded. Please refresh the page.',
					}}
				/>
			</Page>
		);
	}

	if (!activeEnvironment?.id) {
		return (
			<Page className='h-full w-full' heading='Webhooks'>
				<ApiDocsContent tags={['Webhooks']} />
				<EmptyPage
					heading='Webhooks'
					emptyStateCard={{
						heading: 'Select an environment',
						description: 'Select an environment from the header to manage webhooks. Endpoints are scoped to the selected environment only.',
					}}
				/>
			</Page>
		);
	}

	if (isLoading) {
		return (
			<Page className='h-full w-full' heading='Webhooks'>
				<ApiDocsContent tags={['Webhooks']} />
				<div className='flex items-center justify-center h-96'>
					<Loader />
				</div>
			</Page>
		);
	}

	if (isError) {
		toast.error(`Error fetching webhook dashboard: ${error?.message || 'Unknown error'}`);
		return (
			<Page className='h-full w-full' heading='Webhooks'>
				<ApiDocsContent tags={['Webhooks']} />
				<EmptyPage
					heading='Webhooks'
					emptyStateCard={{
						heading: 'Unable to Load Webhooks',
						description: 'There was an error loading the webhook dashboard. Please try refreshing the page.',
					}}
				/>
			</Page>
		);
	}

	if (!data?.svix_enabled) {
		return (
			<Page className='h-full w-full' heading='Webhooks'>
				<ApiDocsContent tags={['Webhooks']} />
				<EmptyPage
					heading='Webhooks'
					emptyStateCard={{
						heading: 'Webhooks',
						description: 'Webhooks are not enabled. Please contact support to enable webhooks.',
					}}
				/>
			</Page>
		);
	}

	return (
		<Page className='h-full w-full' heading='Webhooks'>
			<ApiDocsContent tags={['Webhooks']} />
			<AppPortal {...appPortalProps} />
		</Page>
	);
};

export default WebhookDashboard;
