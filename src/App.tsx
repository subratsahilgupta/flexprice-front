import { RouterProvider } from 'react-router-dom';
import { MainRouter } from '@/core/routes/Routes';
import { UserProvider } from '@/hooks/UserContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ReactQueryProvider from '@/core/tanstack/ReactQueryProvider';
import { Toaster } from 'react-hot-toast';

export default function App() {
	return (
		<ReactQueryProvider>
			<UserProvider>
				<RouterProvider router={MainRouter} />
				{/* Toast Notifications */}
				<Toaster
					toastOptions={{
						success: {
							iconTheme: {
								primary: '#5CA7A0',
								secondary: '#fff',
							},
						},
						error: {
							iconTheme: {
								primary: '#E76E50',
								secondary: '#fff',
							},
						},
					}}
					position='bottom-center'
				/>
			</UserProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</ReactQueryProvider>
	);
}
