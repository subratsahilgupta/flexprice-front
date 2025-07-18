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
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Creating%20a%20feature'),
			},
			{
				title: 'How to link features to plans?',
				description: 'Link features to plans in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Link%20features%20to%20plans'),
			},
			{
				title: 'How to clone open ai pricing?',
				description: 'Clone open ai / cursor style pricing in Flexprice.',
				onClick: () =>
					openGuide(
						'https://docs.flexprice.io/docs/Product%20catalogue/Plans/Use%20cases/Clone%20Open%20AI%20pricing#clone-open-ai-pricing',
					),
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
				title: 'How to choose between advance and arrear billing?',
				description: 'Understand billing models used in plans.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Charges%20in%20plans/Advancevsarrear'),
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
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/invoices/create-a-new-invoice#create-a-new-invoice'),
			},
			{
				title: 'How to manage invoices',
				description: 'Manage invoices in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/ManagingInvoice'),
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
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/create-a-new-payment'),
			},
			{
				title: 'How to update a payment',
				description: 'Create a payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/update-a-payment'),
			},
			{
				title: 'Update a payment',
				description: 'Update an existing payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/delete-a-payment'),
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
				title: 'Create a new credit note',
				description: 'Explore how credit notes work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/credit-notes/create-a-new-credit-note'),
			},
			{
				title: 'Process a draft credit note',
				description: 'Create a new credit note in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/credit-notes/process-a-draft-credit-note'),
			},
			{
				title: 'Void a credit note',
				description: 'Manage credit notes in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/credit-notes/void-a-credit-note'),
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
