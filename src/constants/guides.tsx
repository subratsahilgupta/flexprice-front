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
				title: 'How to create a feature?',
				description: 'Explore how features work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Overview'),
			},
			{
				title: 'How to link features to plans?',
				description: 'Link features to plans in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Creating%20a%20feature'),
			},
			{
				title: 'How to clone open ai pricing?',
				description: 'Clone open ai / cursor style pricing in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Link%20features%20to%20plans'),
			},
		],
	},
	plans: {
		tutorials: [
			{
				title: 'How to create a plan',
				description: 'Explore how plans work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Overview'),
			},
			{
				title: 'How to create a plan',
				description: 'Create a new plan in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Creating%20a%20plan'),
			},
			{
				title: 'How to use billing models in plans',
				description: 'Understand billing models used in plans.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Charges%20in%20plans/Flat%20fee'),
			},
		],
	},
	customers: {
		tutorials: [
			{
				title: 'How to create a customer',
				description: 'Explore how customers work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Overview'),
			},
			{
				title: 'How to archive a customer',
				description: 'Create a new customer in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Creating%20a%20customer'),
			},
			{
				title: 'How to create a subscription',
				description: 'Create a new subscription in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Creating%20a%20subscription'),
			},
		],
	},
	invoices: {
		tutorials: [
			{
				title: 'How to create an invoice',
				description: 'Explore how invoices work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/Overview'),
			},
			{
				title: 'How to manage invoices',
				description: 'Manage invoices in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/Managing%20Invoices'),
			},
			{
				title: 'How to handle partial payments',
				description: 'Handle partial payments in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/partial_payments'),
			},
		],
	},
	payments: {
		tutorials: [
			{
				title: 'How to create a payment',
				description: 'Explore how payments work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/list-payments'),
			},
			{
				title: 'How to update a payment',
				description: 'Create a payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/create-a-new-payment'),
			},
			{
				title: 'Update a payment',
				description: 'Update an existing payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/update-a-payment'),
			},
		],
	},
	secrets: {
		tutorials: [
			{
				title: 'List API Keys',
				description: 'View all API keys in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/list-api-keys'),
			},
			{
				title: 'Create a new API Key',
				description: 'Generate a new API key in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/create-a-new-api-key'),
			},
			{
				title: 'Delete an API Key',
				description: 'Delete an API key in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/delete-an-api-key'),
			},
		],
	},
	creditNotes: {
		tutorials: [
			{
				title: 'Overview of Credit Notes',
				description: 'Explore how credit notes work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Credit%20Notes/Overview'),
			},
			{
				title: 'Creating a Credit Note',
				description: 'Create a new credit note in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Credit%20Notes/Creating%20a%20credit%20note'),
			},
			{
				title: 'Managing Credit Notes',
				description: 'Manage credit notes in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Credit%20Notes/Managing%20credit%20notes'),
			},
		],
	},
	importExport: {
		tutorials: [
			{
				title: 'Overview',
				description: 'Explore import and export options in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/list-tasks'),
			},
			{
				title: 'Import a file',
				description: 'Import a file into Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/create-a-new-task'),
			},
			{
				title: 'Process import task',
				description: 'Process an import task in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/process-a-task'),
			},
		],
	},
};

export default GUIDES;
