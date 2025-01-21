import MainLayout from '@/layouts/MainLayout';
import Auth from '@/pages/auth/Auth';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import CustomerPage from '@/pages/customer/Customer';
import AuthMiddleware from '../auth/AuthProvider';
import BillableMetricsPage from '@/pages/usage/BillableMetrics';
import AddMeterPage from '@/pages/usage/AddMeter';
import EditMeterPage from '@/pages/usage/EditMeterPage';
import PricingPlans from '@/pages/customer/pricingPlans/PricingPlans';
import CreatePlanPage from '@/pages/customer/pricingPlans/CreatePlan';
import CustomerSubscription from '@/pages/customer/CustomerSubscription';
import CustomerDetails from '@/pages/customer/CustomerDetails';
import ErrorPage from '@/pages/error/ErrorPage';
import PlanViewPage from '@/pages/customer/pricingPlans/PlanViewPage';

const RouteNames = {
	home: '/',
	login: '/login',
	usageTracking: '/usage-tracking',
	billableMetric: '/usage-tracking/billable-metric',
	addMeter: '/usage-tracking/billable-metric/add-meter',
	editMeter: '/usage-tracking/billable-metric/edit-meter',
	customerManagement: '/customer-management',
	customers: '/customer-management/customers',
	pricingPlan: '/customer-management/pricing-plan',
	createPlan: '/customer-management/pricing-plan/create-plan',
	editPlan: '/customer-management/pricing-plan/edit-plan',
};

export const MainRouter = createBrowserRouter([
	{
		path: RouteNames.login,
		element: <Auth />,
	},
	{
		path: RouteNames.home,
		element: (
			<AuthMiddleware requiredRole={['admin']}>
				<MainLayout />
			</AuthMiddleware>
		),
		children: [
			{
				path: '/',
				element: <Navigate to={RouteNames.billableMetric} />,
			},
			{
				path: RouteNames.usageTracking,
				children: [
					{
						path: RouteNames.billableMetric,
						element: <BillableMetricsPage />,
					},
					{
						path: RouteNames.addMeter,
						element: <AddMeterPage />,
					},
					{
						path: RouteNames.editMeter,
						element: <EditMeterPage />,
					},
				],
			},
			{
				path: RouteNames.customerManagement,
				children: [
					{
						path: RouteNames.pricingPlan,
						element: <PricingPlans />,
					},
					{
						path: `${RouteNames.pricingPlan}/:planId`,
						element: <PlanViewPage />,
					},
					{
						path: RouteNames.createPlan,
						element: <CreatePlanPage />,
					},
					{
						path: RouteNames.editPlan,
						element: <CreatePlanPage />,
					},
					{
						path: `${RouteNames.customers}`,
						element: <CustomerPage />,
					},
					{
						path: `${RouteNames.customers}/:id/subscription`,
						element: <CustomerSubscription />,
					},
					{
						path: `${RouteNames.customers}/:id/subscription/:subscription_id`,
						element: <CustomerSubscription />,
					},
					{
						path: `${RouteNames.customers}/:id`,
						element: <CustomerDetails />,
					},
				],
			},
		],
	},
	{
		path: '*',
		element: <ErrorPage />,
	},
]);
