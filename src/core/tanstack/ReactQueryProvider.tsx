import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 0,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchInterval: false,
			refetchIntervalInBackground: false,
		},
	},
});

export const refetchQueries = async (queryKeys: (string | undefined)[] | string | undefined) => {
	await queryClient.invalidateQueries({ queryKeys, exact: false });
	await queryClient.refetchQueries({ queryKeys, exact: false });
};

export const invalidateQueries = async (queryKeys: string[]) => {
	await queryClient.invalidateQueries({ queryKeys, exact: false });
};

const ReactQueryProvider = ({ children }: PropsWithChildren) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
