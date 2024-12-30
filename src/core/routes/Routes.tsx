import MainLayout from '@/layouts/MainLayout';
import Auth from '@/pages/auth/Auth';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import CustomerPage from '@/pages/customer/Customer';
import AuthMiddleware from '../auth/AuthProvider';
import BillableMetricsPage from '@/pages/usage/BillableMetrics';
import AddMeterPage from '@/pages/usage/AddMeter';
import EditMeterPage from '@/pages/usage/EditMeterPage';
import PricingPlans from '@/pages/customer/PricingPlans';
import CreatePlanPage from '@/pages/customer/CreatePlan';
import path from 'path';
import CreateCustomerPage from '@/pages/customer/CreateCustomer';

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
	customerManagement: {
		path: '/customer-management',
		customers: {
			path: 'customers',
			createCustomer: {
				path: 'create-customer',
			},
		},
		pricingPlan: {
			path: 'pricing-plan',
			createPlan: {
				path: 'create-plan',
			},
			editPlan: {
				path: 'edit-plan',
			},
		},
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
				element: <Navigate to={`${RouteNames.usageTracking.path}/${RouteNames.usageTracking.billableMetric.path}`} />,
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
			{
				path: RouteNames.customerManagement.path,
				children: [
					{
						path: RouteNames.customerManagement.pricingPlan.path,
						element: <PricingPlans />,
					},
					{
						path: `${RouteNames.customerManagement.pricingPlan.path}/${RouteNames.customerManagement.pricingPlan.createPlan.path}`,
						element: <CreatePlanPage />,
					},
					{
						path: `${RouteNames.customerManagement.pricingPlan.path}/${RouteNames.customerManagement.pricingPlan.editPlan.path}`,
						element: <CreatePlanPage />,
					},
					{
						path: `${RouteNames.customerManagement.path}/${RouteNames.customerManagement.customers.path}`,
						element: <CustomerPage />,
					},
					{
						path: `${RouteNames.customerManagement.path}/${RouteNames.customerManagement.customers.path}/${RouteNames.customerManagement.customers.createCustomer.path}`,
						element: <CreateCustomerPage />,
					},
				],
			},
		],
	},
]);
