import MainLayout from '@/layouts/MainLayout';
import Auth from '@/pages/auth/Auth';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import CustomerPage from '@/pages/customer/customers/Customers';
import AuthMiddleware from '../auth/AuthProvider';
import MeterPage from '@/pages/usage/meter/MeterPage';
import AddMeterPage from '@/pages/usage/meter/AddMeter';
import EditMeterPage from '@/pages/usage/meter/EditMeterPage';
import PricingPlans from '@/pages/product-catalog/pricingPlans/PricingPlans';
import CreatePlanPage from '@/pages/product-catalog/pricingPlans/CreatePlan';
import CustomerSubscription from '@/pages/customer/customers/CustomerSubscription';
import CustomerDetails from '@/pages/customer/customers/CustomerDetails';
import ErrorPage from '@/pages/error/ErrorPage';
import PlanViewPage from '@/pages/product-catalog/pricingPlans/PlanViewPage';
import EventsPage from '@/pages/usage/events/Events';
import QueryPage from '@/pages/usage/query/Query';
import InvoicePage from '@/pages/customer/invoices/InvoicePage';
import InvoiceDetailsPage from '@/pages/customer/invoices/InvoiceDetailsPage';
import Invoice from '@/pages/customer/tabs/Invoice';
import Overview from '@/pages/customer/tabs/Overview';
import WalletTab from '@/pages/customer/tabs/Wallet';
import SubscriptionDetails from '@/pages/customer/customers/SubscriptionDetails';
import AddCreditPage from '@/pages/customer/invoices/AddCreditPage';
import CreditNote from '@/pages/customer/tabs/CreditNote';
import AddFeaturePage from '@/pages/product-catalog/features/AddFeature';
import FeaturesPage from '@/pages/product-catalog/features/Features';
import ImportExport from '@/pages/customer/import-export/ImportExport';
import Integrations from '@/pages/insights-tools/integrations/Integrations';
import IntegrationDetails from '@/pages/insights-tools/integrations/IntegrationDetails';
import CustomerSubscriptionPage from '@/pages/customer/customers/CustomerSubscriptionPage';

export const RouteNames = {
	home: '/',
	login: '/login',

	// usage tracking routes
	usageTracking: '/usage-tracking',
	billableMetric: '/usage-tracking/meter',
	addMeter: '/usage-tracking/meter/add-meter',
	editMeter: '/usage-tracking/meter/edit-meter',
	eventsPage: '/usage-tracking/events',
	queryPage: '/usage-tracking/query',

	// customer management routes
	customerManagement: '/customer-management',
	customers: '/customer-management/customers',
	invoices: '/customer-management/invoices',
	invoiceDetail: '/customer-management/invoices/:invoiceId',

	// import export routes

	// product catalog routes
	productCatalog: '/product-catalog',
	createPlan: '/product-catalog/pricing-plan/create-plan',
	pricingPlan: '/product-catalog/pricing-plan',
	editPlan: '/product-catalog/pricing-plan/edit-plan',

	features: '/product-catalog/features',
	createFeature: '/product-catalog/features/create-feature',

	// insights and tools
	insights: '/insights-&-tools',
	integrations: '/insights-&-tools/integrations',
	integrationDetails: '/insights-&-tools/integrations/:id',
	importExport: '/insights-&-tools/bulk-imports',
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
						element: <MeterPage />,
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
						path: `${RouteNames.customers}`,
						element: <CustomerPage />,
					},
					{
						path: `${RouteNames.customers}/:id/add-subscription`,
						element: <CustomerSubscription />,
					},
					{
						path: `${RouteNames.customers}/:id/subscription`,
						element: <CustomerSubscriptionPage />,
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
								path: 'credit-note',
								element: <CreditNote />,
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
			{
				path: RouteNames.productCatalog,
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
						path: RouteNames.features,
						element: <FeaturesPage />,
					},
					{
						path: RouteNames.createFeature,
						element: <AddFeaturePage />,
					},
				],
			},
			{
				path: RouteNames.insights,
				children: [
					{
						path: RouteNames.integrations,
						element: <Integrations />,
					},
					{
						path: RouteNames.integrationDetails,
						element: <IntegrationDetails />,
					},
					{
						path: `${RouteNames.importExport}`,
						element: <ImportExport />,
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
