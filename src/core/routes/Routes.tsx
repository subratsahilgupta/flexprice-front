import MainLayout from '@/layouts/MainLayout';
import Auth from '@/pages/auth/Auth';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import CustomerPage from '@/pages/customer/customers/Customer';
import AuthMiddleware from '../auth/AuthProvider';
import BillableMetricsPage from '@/pages/usage/meter/BillableMetrics';
import AddMeterPage from '@/pages/usage/meter/AddMeter';
import EditMeterPage from '@/pages/usage/meter/EditMeterPage';
import PricingPlans from '@/pages/customer/pricingPlans/PricingPlans';
import CreatePlanPage from '@/pages/customer/pricingPlans/CreatePlan';
import CustomerSubscription from '@/pages/customer/customers/CustomerSubscription';
import CustomerDetails from '@/pages/customer/customers/CustomerDetails';
import ErrorPage from '@/pages/error/ErrorPage';
import PlanViewPage from '@/pages/customer/pricingPlans/PlanViewPage';
import EventsPage from '@/pages/usage/events/Events';
import QueryPage from '@/pages/usage/query/Query';
import InvoicePage from '@/pages/customer/invoices/InvoicePage';
import InvoiceDetailsPage from '@/pages/customer/invoices/InvoiceDetailsPage';
import Invoice from '@/pages/customer/tabs/Invoice';
import Overview from '@/pages/customer/tabs/Overview';
import WalletTab from '@/pages/customer/tabs/Wallet';
import SubscriptionDetails from '@/pages/customer/customers/SubscriptionDetails';
import AddCreditPage from '@/pages/customer/invoices/AddCreditPage';

const RouteNames = {
	home: '/',
	login: '/login',

	// usage tracking routes
	usageTracking: '/usage-tracking',
	billableMetric: '/usage-tracking/billable-metric',
	addMeter: '/usage-tracking/billable-metric/add-meter',
	editMeter: '/usage-tracking/billable-metric/edit-meter',
	eventsPage: '/usage-tracking/events',
	queryPage: '/usage-tracking/query',

	// customer management routes
	customerManagement: '/customer-management',
	customers: '/customer-management/customers',
	pricingPlan: '/customer-management/pricing-plan',
	createPlan: '/customer-management/pricing-plan/create-plan',
	editPlan: '/customer-management/pricing-plan/edit-plan',
	invoices: '/customer-management/invoices',
	invoiceDetail: '/customer-management/invoices/:invoiceId',
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
					{
						path: RouteNames.eventsPage,
						element: <EventsPage />,
					},
					{
						path: RouteNames.queryPage,
						element: <QueryPage />,
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
						path: `${RouteNames.customers}/:id/add-subscription`,
						element: <CustomerSubscription />,
					},
					{
						path: `${RouteNames.customers}/:id/subscription`,
						element: <Navigate to={'/customer-management/customers'} />,
					},
					// {
					// 	path: `${RouteNames.customers}/:id/subscription/:subscription_id`,
					// 	element: <CustomerSubscription />,
					// },
					{
						path: `${RouteNames.customers}/:id`,
						element: <CustomerDetails />,
						children: [
							{
								path: '',
								element: <Overview />,
								index: true,
							},
							{
								path: 'overview',
								element: <Overview />,
								index: true,
							},
							{
								path: 'wallet',
								element: <WalletTab />,
							},
							{
								path: 'invoice',
								element: <Invoice />,
							},
							{
								path: 'invoice/:invoice_id',
								element: <Invoice />,
							},
							{
								path: 'invoice/:invoice_id/credit-note',
								element: <AddCreditPage />,
							},
							{
								path: 'subscription/:subscription_id',
								element: <SubscriptionDetails />,
							},
						],
					},
					{
						path: `${RouteNames.invoices}`,
						element: <InvoicePage />,
					},
					{
						path: `${RouteNames.invoiceDetail}`,
						element: <InvoiceDetailsPage />,
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
