import { Loader, Page } from '@/components/atoms';
import WebhookApi from '@/api/WebhookApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AppPortal } from 'svix-react';

interface WebhookDashboardResponse {
	url: string;
	token: string;
}

const WebhookDashboard = () => {
	const {
		data: webhookDashboardResponse,
		isLoading,
		isError,
	} = useQuery<WebhookDashboardResponse>({
		queryKey: ['webhookDashboardUrl'],
		queryFn: WebhookApi.getWebhookDashboardUrl,
	});

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching webhook dashboard url');
		return null;
	}

	return (
		<Page className='h-full w-full' heading='Webhooks'>
			<AppPortal
				primaryColor='#000000'
				style={{
					width: '100%',
					height: '100%',
					color: '#000000',
					border: 'none',
					backgroundColor: '#000000',
				}}
				url={webhookDashboardResponse?.url}
			/>
		</Page>
	);
};

export default WebhookDashboard;
