import { Loader, Page } from '@/components/atoms';
import { ApiDocsContent } from '@/components/molecules';
import WebhookApi from '@/api/WebhookApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AppPortal } from 'svix-react';
import { EmptyPage } from '@/components/organisms';

const WebhookDashboard = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['webhookDashboardUrl'],
		queryFn: async () => await WebhookApi.getWebhookDashboardUrl(),
	});

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching webhook dashboard url');
		return null;
	}

	if (!data?.svix_enabled) {
		return (
			<EmptyPage
				heading='Webhooks'
				emptyStateCard={{
					heading: 'Webhooks',
					description: 'Webhooks are not enabled. Please contact support to enable webhooks.',
				}}
			/>
		);
	}

	return (
		<Page className='h-full w-full' heading='Webhooks'>
			<ApiDocsContent tags={['Webhooks']} />
			<AppPortal
				primaryColor='#000000'
				style={{
					width: '100%',
					height: '100%',
					color: '#000000',
					border: 'none',
					backgroundColor: '#000000',
				}}
				url={data?.url ?? ''}
			/>
		</Page>
	);
};

export default WebhookDashboard;
