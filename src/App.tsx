import { RouterProvider } from 'react-router-dom';
import { MainRouter } from '@/core/routes/Routes';
import { UserProvider } from '@/hooks/UserContext';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ReactQueryProvider from '@/core/tanstack/ReactQueryProvider';
import { Toaster } from 'react-hot-toast';
// import VercelSpeedInsights from '@/core/vercel/vercel';

const App = () => {
	return (
		<ReactQueryProvider>
			<UserProvider>
				<RouterProvider router={MainRouter} />
				{/* <VercelSpeedInsights /> */}

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
			{/* <ReactQueryDevtools initialIsOpen={false} /> */}
		</ReactQueryProvider>
	);
};

export default App;
