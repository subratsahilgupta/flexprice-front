import { Button, Card, Page } from '@/components/atoms';
import { AlignJustify, ArrowRight } from 'lucide-react';

interface TutorialItem {
	id: number;
	title: string;
	description: string;
	onClick: () => void;
}

const openDocs = () => {
	window.open('https://docs.flexprice.io/', '_blank');
};

const tutorials: TutorialItem[] = [
	{
		id: 1,
		title: 'Getting Started Guide',
		description: 'Learn the basics of Flexprice in 5 minutes',
		onClick: openDocs,
	},
	{
		id: 2,
		title: 'Setup Your First Price',
		description: 'Create and configure your first dynamic price',
		onClick: openDocs,
	},
	{
		id: 3,
		title: 'API Integration Guide',
		description: 'Learn how to integrate Flexprice with your application',
		onClick: openDocs,
	},
	{
		id: 4,
		title: 'Billing Configuration',
		description: 'Configure your billing settings and preferences',
		onClick: openDocs,
	},
	{
		id: 5,
		title: 'Watch Tutorial Video',
		description: 'A comprehensive video guide to get you started',
		onClick: openDocs,
	},
	{
		id: 6,
		title: 'Connect Your Stripe',
		description: 'Link your Stripe account with Flexprice',
		onClick: openDocs,
	},
];

const OnboardingPage = () => {
	return (
		<Page>
			{/* Top Containers */}
			<div className='w-full flex gap-6 mb-16'>
				{/* Welcome Container */}
				<div className='flex-1 rounded-[20px] bg-[#dde1eb] p-8'>
					<div className='flex w-full items-start justify-between'>
						<div className='w-[60%]'>
							<h1 className='text-xl font-semibold tracking-tight mb-2'>Welcome to Flexprice!</h1>
							<p className='text-slate-800 text-sm mb-6'>Let's get Acme's pricing and billing started!</p>
							<Button>Book a Demo</Button>
						</div>
						<div className='flex-shrink-0 ml-8 w-[40%]'>
							<img src='/assets/svg/onboarding_hero.svg' alt='Onboarding Hero' className='h-auto' />
						</div>
					</div>
				</div>

				{/* Learn More Container */}
				<div className='flex-1 bg-[#0B1121] rounded-[20px] p-8 relative overflow-hidden'>
					<div className='absolute inset-0'>
						<div className='absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 via-[#B114FF]/20 to-[#3B82F6]/20'></div>
					</div>
					<div className='relative z-10'>
						<span className='inline-block text-[#4ADE80] text-sm font-medium mb-2'>Learn More</span>
						<h2 className='text-xl font-semibold text-white tracking-tight mb-3'>How to get started with Flexprice</h2>
						<p className='text-slate-300 text-sm'>Get your billing started in 5 minutes!</p>
					</div>
				</div>
			</div>

			{/* Quick Start Section */}
			<div>
				<h2 className='text-2xl font-semibold text-slate-900 mb-6'>Quick Start</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
					{tutorials.map((tutorial) => (
						<Card
							key={tutorial.id}
							className='group bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-200 hover:border-slate-200 cursor-pointer'
							onClick={tutorial.onClick}>
							<div className='flex items-start gap-3 mb-3'>
								<AlignJustify className='w-5 h-5 mt-0.5 text-slate-400' />
								<div className='flex-1'>
									<h3 className='text-slate-900 text-base font-medium mb-2'>{tutorial.title}</h3>
									<p className='text-slate-500 text-sm leading-relaxed'>{tutorial.description}</p>
								</div>
							</div>
							<div className='flex justify-end mt-4'>
								<ArrowRight className='w-5 h-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5' />
							</div>
						</Card>
					))}
				</div>
			</div>
		</Page>
	);
};

export default OnboardingPage;
