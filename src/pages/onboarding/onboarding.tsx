import { Button, Card, Page } from '@/components/atoms';
import { AlignJustify, ArrowRight } from 'lucide-react';

export interface TutorialItem {
	title: string;
	description: string;
	onClick: () => void;
}

const tutorials: TutorialItem[] = [
	{
		title: 'Getting Started',
		description: 'Learn the basics of Flexprice in 5 minutes',
		onClick: () => window.open('https://docs.flexprice.io/guides/getting-started/video', '_blank'),
	},
	{
		title: 'Set Up Pricing Plans',
		description: 'Create and configure your first pricing plan',
		onClick: () => window.open('https://docs.flexprice.io/guides/plan/pricing-plan-create', '_blank'),
	},
	{
		title: 'Define Usage Metering',
		description: 'Set up billable metrics to track customer usage',
		onClick: () => window.open('https://docs.flexprice.io/guides/billable-metric/billable-metrics-create', '_blank'),
	},
	{
		title: 'Configure Credits & Wallets',
		description: 'Manage prepaid wallets, free credits, and top-ups',
		onClick: () => window.open('https://docs.flexprice.io/guides/wallet/customers-wallet', '_blank'),
	},
	{
		title: 'Customer Management',
		description: 'Create customers, assign plans, and manage subscriptions',
		onClick: () => window.open('https://docs.flexprice.io/guides/subscription/customers-create-subscription', '_blank'),
	},
	{
		title: 'Self-Hosting & Configuration',
		description: 'Set up and deploy Flexprice on your own infrastructure',
		onClick: () => window.open('https://docs.flexprice.io/guides/self-hosted/guide', '_blank'),
	},
];

const OnboardingPage = () => {
	return (
		<Page>
			{/* Top Containers */}
			<div className='w-full flex gap-6 mb-16'>
				{/* Welcome Container */}
				<div className='flex-1 w-[70%] flex-grow rounded-[20px] bg-[#dde1eb] p-8'>
					<div className='flex w-full items-start justify-between'>
						<div className='w-[60%]'>
							<h1 className='text-xl font-semibold tracking-tight mb-2'>Welcome to Flexprice!</h1>
							<p className='text-slate-800 text-sm mb-6'>Let's get your pricing and billing started!</p>
							<Button
								onClick={() => {
									window.open('https://calendly.com/flexprice-30mins-chat/manish', '_blank');
								}}>
								Book a Demo
							</Button>
						</div>
						<div className='flex-shrink-0 ml-8 w-[40%]'>
							<img src='/assets/svg/onboarding_hero.svg' alt='Onboarding Hero' className='h-auto' />
						</div>
					</div>
				</div>
				{/* Learn More Container */}
				<div className='flex-1 max-w-[35%] bg-[#0B1121] rounded-[20px] relative overflow-hidden'>
					<iframe
						src='https://www.loom.com/embed/60d8308781254fe0bc5be341501f9fd5?sid=c034e9a8-e243-4def-ab50-976f08d56cee&amp;hideEmbedTopBar=true&amp;hide_title=true&amp;hide_owner=true&amp;hide_speed=true&amp;hide_share=true'
						allowFullScreen
						style={{ position: 'absolute', width: '100%', top: 0, left: 0, height: '100%' }}></iframe>

					{/* <div className='absolute inset-0'>
						<div className='absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 via-[#B114FF]/20 to-[#3B82F6]/20'></div>
					</div>
					<div className='relative z-10'>
						<span className='inline-block text-[#4ADE80] text-sm font-medium mb-2'>Learn More</span>
						<h2 className='text-xl font-semibold text-white tracking-tight mb-3'>How to get started with Flexprice</h2>
						<p className='text-slate-300 text-sm'>Get your billing started in 5 minutes!</p>
					</div> */}
				</div>
			</div>
			{/* Quick Start Section */}
			<div className='w-full'>
				<h2 className='text-2xl font-semibold text-slate-900 mb-6'>Quick Start</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
					{tutorials.map((tutorial, index) => (
						<Card
							key={index}
							className='group bg-white border border-slate-100 rounded-lg p-5 hover:border-blue-100 hover:bg-slate-50 transition-colors duration-200 cursor-pointer'
							onClick={tutorial.onClick}>
							<div className='flex gap-4'>
								<div className='flex-shrink-0 mt-1'>
									<AlignJustify className='w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors duration-200' />
								</div>

								<div className='flex-1 min-w-0'>
									<h3 className='text-slate-800 text-base font-medium mb-1.5 group-hover:text-blue-600 transition-colors duration-200'>
										{tutorial.title}
									</h3>
									<p className='text-slate-500 text-sm leading-relaxed'>{tutorial.description}</p>

									<div className='flex items-center gap-1 mt-3 text-slate-400 group-hover:text-blue-500 transition-colors duration-200'>
										<span className='text-xs font-medium'>Learn more</span>
										<ArrowRight className='w-4 h-4' />
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</Page>
	);
};

export default OnboardingPage;
