import MainLayout from '@/layouts/MainLayout';
import Auth from '@/pages/auth/Auth';
import { createBrowserRouter } from 'react-router-dom';
import CustomerPage from '@/pages/customer/Customer';
import AuthMiddleware from '../auth/AuthProvider';

const RouteNames = {
	home: {
		path: '/',
	},
	login: {
		path: '/login',
	},
	plans: {
		path: '/plans',
		create: {
			path: '/create',
		},
		edit: {
			path: '/edit/:id',
			routing_path: '/edit/',
		},
	},
	metering: {
		path: '/metering',
	},
	query: {
		path: '/query',
	},
	customer: {
		path: '/customer',
		detail: {
			path: '/details/:id',
			routing_path: '/details/',
		},
	},
};

export const MainRouter = createBrowserRouter([
	{
		path: RouteNames.login.path,
		element: <Auth />,
	},

	{
		path: RouteNames.home.path,
		element: (
			<AuthMiddleware requiredRole={['admin']}>
				<MainLayout />
			</AuthMiddleware>
		),
		children: [
			{
				path: '/',
				element: <CustomerPage />,
			},
			{
				path: RouteNames.plans.path,
				element: <CustomerPage />,
			},
		],
	},
]);
