import { RouterProvider } from 'react-router-dom';
import { MainRouter } from '@/core/routes/Routes';
import { UserProvider } from '@/hooks/UserContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ReactQueryProvider from '@/core/tanstack/ReactQueryProvider';

export default function App() {
	return (
		<ReactQueryProvider>
			<UserProvider>
				<RouterProvider router={MainRouter} />
			</UserProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</ReactQueryProvider>
	);
}
