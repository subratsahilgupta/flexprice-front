import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('svix-react', () => ({
	SvixProvider: ({ children }: { children: React.ReactNode }) => <div data-testid='svix-provider'>{children}</div>,
	AppPortal: ({ url }: { url: string }) => <div data-testid='svix-hosted-portal' data-url={url} />,
	useEndpoints: () => ({
		data: [],
		loading: false,
		error: undefined,
		reload: vi.fn(),
		hasPrevPage: false,
		hasNextPage: false,
		prevPage: vi.fn(),
		nextPage: vi.fn(),
	}),
	useNewEndpoint: () => ({
		url: { value: '', setValue: vi.fn() },
		description: { value: '', setValue: vi.fn() },
		eventTypes: { value: [], setValue: vi.fn() },
		rateLimitPerSecond: { value: undefined, setValue: vi.fn() },
		createEndpoint: vi.fn(),
	}),
	useEndpointFunctions: () => ({ deleteEndpoint: vi.fn(), updateEndpoint: vi.fn(), recoverEndpointMessages: vi.fn() }),
	useEndpointSecret: () => ({ data: undefined, loading: false, error: undefined, reload: vi.fn() }),
	useSvix: () => ({ svix: { endpoint: { create: vi.fn(), delete: vi.fn(), getSecret: vi.fn() } }, appId: 'x' }),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const mockData = vi.fn();
vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@tanstack/react-query')>();
	return { ...actual, useQuery: () => mockData() };
});
vi.mock('@/hooks/useEnvironment', () => ({ default: () => ({ activeEnvironment: { id: 'env_1' } }) }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/components/molecules/ApiDocs/ApiDocs', () => ({ ApiDocsContent: () => null }));

import WebhookDashboard from './WebhookDashboard';

describe('WebhookDashboard', () => {
	it('renders SvixProvider portal when svix enabled with token and no usable hosted url', () => {
		mockData.mockReturnValue({
			data: { svix_enabled: true, url: '', token: 'tok_123', app_id: 'tenant_env' },
			isLoading: false,
			isError: false,
		});
		render(<WebhookDashboard />);
		expect(screen.getByTestId('svix-provider')).toBeInTheDocument();
		expect(screen.queryByTestId('svix-hosted-portal')).not.toBeInTheDocument();
	});

	it('renders hosted AppPortal when svix enabled with a real hosted url', () => {
		mockData.mockReturnValue({
			data: { svix_enabled: true, url: 'https://app.svix.com/login#key=abc' },
			isLoading: false,
			isError: false,
		});
		render(<WebhookDashboard />);
		expect(screen.getByTestId('svix-hosted-portal')).toBeInTheDocument();
		expect(screen.queryByTestId('svix-provider')).not.toBeInTheDocument();
	});

	it('renders fallback when svix disabled', () => {
		mockData.mockReturnValue({ data: { svix_enabled: false }, isLoading: false, isError: false });
		render(<WebhookDashboard />);
		expect(screen.queryByTestId('svix-provider')).not.toBeInTheDocument();
		expect(screen.queryByTestId('svix-hosted-portal')).not.toBeInTheDocument();
	});
});
