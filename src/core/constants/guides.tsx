import { TutorialItem } from '@/pages/onboarding/onboarding';

const openGuide = (url: string) => {
	window.open(url, '_blank');
};

const GUIDES: Record<
	string,
	{
		tutorials: TutorialItem[];
	}
> = {
	features: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Learn about Features in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Overview'),
			},
			{
				title: 'Creating a feature',
				description: 'Learn how to create a feature in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Creating%20a%20feature'),
			},
			{
				title: 'Link features to plans',
				description: 'Learn how to link features to plans in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Link%20features%20to%20plans'),
			},
			{
				title: 'Use cases',
				description: 'Learn how to use features in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Use%20cases'),
			},
		],
	},
	plans: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Learn about Plans in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Overview'),
			},
			{
				title: 'Creating a plan',
				description: 'Learn how to create a plan in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Creating%20a%20plan'),
			},
			{
				title: 'Advance vs Arrear',
				description: 'Learn about Advance vs Arrear in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Charges%20in%20plans/Advancevsarrear'),
			},
			// {
			// 	title: "Localisation",
			// 	description: "Learn about Localisation in Flexprice.",
			// 	onClick: () => openGuide("https://docs.flexprice.io/docs/Product%20catalogue/Plans/Localisation"),
			// },
			{
				title: 'Billing Models in plans',
				description: 'Learn about Billing Models in plans in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Charges%20in%20plans/Flat%20fee'),
			},
			{
				title: 'Use cases',
				description: 'Learn about Use cases in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Use%20cases/Clone%20Open%20AI%20pricing'),
			},
			{
				title: 'Archiving a plan',
				description: 'Learn about Archiving a plan in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Archiving%20a%20plan'),
			},
		],
	},
	customers: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Learn about Customers in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Overview'),
			},
			{
				title: 'Creating a customer',
				description: 'Learn how to create a customer in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Creating%20a%20customer'),
			},
			{
				title: 'Archive a customer',
				description: 'Learn about Archive a customer in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Archive%20a%20customer'),
			},
			{
				title: 'Use cases',
				description: 'Learn about Use cases in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/customers/get-customer-usage-summary'),
			},
		],
	},
	invoices: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Learn about Invoices in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/Overview'),
			},
			{
				title: 'Managing Invoices',
				description: 'Learn how to manage invoices in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/Managing%20Invoices'),
			},
			{
				title: 'Partial payments',
				description: 'Learn about Partial payments in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/partial_payments'),
			},
		],
	},
	payments: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Learn about Payments in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/list-payments'),
			},
			{
				title: 'Create a new payment',
				description: 'Learn how to create a new payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/create-a-new-payment'),
			},
			{
				title: 'Update a payment',
				description: 'Learn how to update a payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/update-a-payment'),
			},
			{
				title: 'Delete a payment',
				description: 'Learn how to delete a payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/delete-a-payment'),
			},
			{
				title: 'Process a payment',
				description: 'Learn how to process a payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/process-a-payment'),
			},
		],
	},
	secrets: {
		tutorials: [
			{
				title: 'List API keys',
				description: 'Learn about API keys in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/list-api-keys'),
			},
			{
				title: 'Create a new API key',
				description: 'Learn how to create a new API key in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/create-a-new-api-key'),
			},
			{
				title: 'Delete an API key',
				description: 'Learn how to delete an API key in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/delete-an-api-key'),
			},
		],
	},
	importExport: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Learn about Import and Export in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/list-tasks'),
			},
			{
				title: 'Import a file',
				description: 'Learn how to import a file in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/create-a-new-task'),
			},
			{
				title: 'Process import task',
				description: 'Learn how to process an import task in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/process-a-task'),
			},
			{
				title: 'Update import task',
				description: 'Learn how to update an import task in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/update-task-status'),
			},
		],
	},
};
export default GUIDES;
