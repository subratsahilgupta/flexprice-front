import MainLayout from '@/layouts/MainLayout';
import Auth from '@/pages/auth/Auth';
import { createBrowserRouter } from 'react-router-dom';
import CustomerPage from '@/pages/customer/Customer';
import AuthMiddleware from '../auth/AuthProvider';
import BillableMetricsPage from '@/pages/usage/BillableMetrics';
import AddMeterPage from '@/pages/usage/AddMeter';
import EditMeterPage from '@/pages/usage/EditMeterPage';

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
	usageTracking: {
		path: '/usage-tracking',
		billableMetric: {
			path: 'billable-metric',
			addMeter: {
				path: 'add-meter',
			},
			editMeter: {
				path: 'edit-meter',
			},
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
			{
				path: RouteNames.usageTracking.path,
				children: [
					{
						path: RouteNames.usageTracking.billableMetric.path,
						element: <BillableMetricsPage />,
					},
					{
						path: `${RouteNames.usageTracking.billableMetric.path}/${RouteNames.usageTracking.billableMetric.addMeter.path}`,
						element: <AddMeterPage />,
					},
					{
						path: `${RouteNames.usageTracking.billableMetric.path}/${RouteNames.usageTracking.billableMetric.editMeter.path}`,
						element: <EditMeterPage />,
					},
				],
			},
		],
	},
]);
