export type Integration = {
	name: string;
	description: string;
	logo: string;
	tags: string[];
	comingSoon?: boolean;
	info?: {
		title: string;
		description: string[];
	}[];
};

export const integrations: Integration[] = [
	{
		name: 'Stripe',
		description: 'Send invoices, calculate tax and collect payment.',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
		tags: ['Payment', 'Calculate Tax', 'Invoice Customer'],
		// comingSoon: true,
		info: [
			{
				title: 'Overview',
				description: ['The OpenMeter Stripe app enables invoicing, tax collection, and payment via Stripe.'],
			},
			{
				title: 'Stripe Invoicing',
				description: ['Create and send invoices through Stripe Invoicing directly from OpenMeter and automatically collect payments.'],
			},
			{
				title: 'Automatic Tax Calculations',
				description: [
					'Leverage Stripe Tax to handle complex tax rules and rates for any region. The integration ensures accurate, up-to-date tax calculations for each invoice, removing the guesswork and reducing compliance risks.',
				],
			},
			{
				title: 'Secure and Flexible Payments',
				description: [
					'Collect payments quickly and securely via Stripe’s trusted payment gateway. Your customers can choose from various payment methods—credit card, ACH, and more—to improve the overall customer experience and speed up cash flow.',
				],
			},
		],
	},
	// {
	// 	name: 'Razorpay',
	// 	description:
	// 		'Razorpay is a payments solution in India that allows businesses to accept, process and disburse payments with its product suite.',
	// 	logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Razorpay_logo.png',
	// 	tags: [],
	// 	comingSoon: true,
	// },
];

export const comingSoonIntegration: Integration[] = [
	// {
	// 	name: 'Sandbox',
	// 	description: 'Sandbox can be used to test OpenMeter without external connections.',
	// 	logo: 'https://via.placeholder.com/150',
	// 	tags: ['Payment', 'Calculate Tax', 'Invoice Customer'],
	// 	comingSoon: true,
	// },
	{
		name: 'PayPal',
		description: 'PayPal is an online payment system that supports online money transfers.',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
		tags: ['Payment', 'Invoice Customer'],
		comingSoon: true,
	},
	{
		name: 'Square',
		description: 'Square helps millions of sellers run their business-from secure credit card processing to point of sale solutions.',
		logo: 'https://cdn4.iconfinder.com/data/icons/payment-gateway/128/square.png',
		tags: ['Payment', 'Invoice Customer'],
		comingSoon: true,
	},
	{
		name: 'Razorpay',
		description:
			'Razorpay is a payments solution in India that allows businesses to accept, process and disburse payments with its product suite.',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Razorpay_logo.png',
		tags: ['Payment', 'Calculate Tax', 'Invoice Customer'],
		comingSoon: true,
	},
];
