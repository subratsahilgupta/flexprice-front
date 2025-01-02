import { RouterProvider } from 'react-router-dom';
import { MainRouter } from '@/core/routes/Routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/hooks/UserContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<RouterProvider router={MainRouter} />
			</UserProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
