import { Page, Button, Card } from '@/components/atoms';
import { FC, ReactNode, useEffect, useState } from 'react';
import { AlignJustify, ArrowRight, Sparkles, BookOpen, Rocket, FileText, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ApiDocsContent, fetchApidocsJson } from '@/components/molecules/ApiDocs/ApiDocs';
import { fetchAndExtractSnippetsByTags } from '@/components/molecules/ApiDocs/fetch_api_docs';
import { TutorialItem } from '@/pages/onboarding/onboarding';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Props {
	children?: ReactNode;
	title?: string;
	description?: string;
	onAddClick?: () => void;
	tags?: string[];
	addButtonLabel?: string;
	illustration?: string;
	learnMoreUrl?: string;
}

const EmptyPage: FC<Props> = ({
	children,
	title = 'Welcome to Flexprice!',
	description,
	onAddClick,
	tags,
	addButtonLabel,
	illustration = '/assets/svg/onboarding_hero.svg',
	learnMoreUrl = 'https://docs.flexprice.io/guides/self-hosted/guide',
}) => {
	const { data: docs, isLoading } = useQuery({
		queryKey: ['openapi-json'],
		queryFn: fetchApidocsJson,
		staleTime: 1000 * 60 * 60 * 24,
	});

	const [tutorials, setTutorials] = useState<TutorialItem[]>([]);

	useEffect(() => {
		const fetchSnippets = async (tags: string[]) => {
			const snippets = await fetchAndExtractSnippetsByTags(tags, docs);
			const tutorials: TutorialItem[] = snippets.map((snippet) => ({
				id: Number(snippet.url!.replace(/\D/g, '')),
				title: snippet.label,
				description: snippet.description,
				onClick: () => {
					const url =
						'https://docs.flexprice.io/api-reference/' +
						tags?.[0].toLocaleLowerCase().replace(/ /g, '-') +
						'/' +
						snippet.label.toLowerCase().replace(/ /g, '-');
					window.open(url, '_blank');
				},
			}));
			setTutorials(tutorials);
		};
		if (tags) {
			fetchSnippets(tags);
		}
	}, [tags, docs]);

	return (
		<Page>
			<div className='w-full flex gap-6 mb-16'>
				{/* Main Content Container */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='flex-[0.6] rounded-[20px] bg-gradient-to-br from-slate-50 to-blue-50 p-10 relative overflow-hidden border border-slate-200/50 shadow-sm'>
					{/* Background Decorative Elements */}
					<div className='absolute inset-0 overflow-hidden'>
						<div className='absolute -top-[40%] -right-[40%] w-[80%] h-[80%] bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-full blur-3xl' />
						<div className='absolute -bottom-[40%] -left-[40%] w-[80%] h-[80%] bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl' />
						<div className='absolute top-0 left-0 w-full h-full bg-white/50 backdrop-blur-3xl' />
					</div>

					<div className='relative z-10'>
						{/* Header Section */}
						<div className='flex items-start justify-between mb-8'>
							<div className='flex-1'>
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className='inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4'>
									<Sparkles className='w-4 h-4 text-blue-500 mr-2' />
									<span className='text-sm font-medium text-blue-700'>Get Started</span>
								</motion.div>
								<motion.h1
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.3 }}
									className='text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent'>
									{title}
								</motion.h1>
								<motion.p
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 }}
									className='text-slate-600 text-lg mb-8 leading-relaxed max-w-[90%]'>
									{description}
								</motion.p>
							</div>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className='flex-shrink-0 ml-8'>
								<img src={illustration} alt='Feature illustration' className='w-32 h-32 object-contain' />
							</motion.div>
						</div>

						{/* Features Grid */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
							className='grid grid-cols-2 gap-4 mb-8'>
							<div className='flex items-start space-x-3 p-4 rounded-lg bg-white/60 border border-slate-200/60 hover:border-blue-100/60 transition-colors duration-200'>
								<div className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50'>
									<FileText className='w-4 h-4 text-blue-600' />
								</div>
								<div>
									<h3 className='font-medium text-slate-900 mb-1'>Documentation</h3>
									<p className='text-sm text-slate-500'>Comprehensive guides and API references</p>
								</div>
							</div>
							<div className='flex items-start space-x-3 p-4 rounded-lg bg-white/60 border border-slate-200/60 hover:border-blue-100/60 transition-colors duration-200'>
								<div className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50'>
									<Users className='w-4 h-4 text-indigo-600' />
								</div>
								<div>
									<h3 className='font-medium text-slate-900 mb-1'>Community</h3>
									<p className='text-sm text-slate-500'>Join our growing developer community</p>
								</div>
							</div>
						</motion.div>

						{children && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.6 }}
								className='mb-8'>
								{children}
							</motion.div>
						)}

						{/* CTA Button */}
						{onAddClick && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
								<Button
									onClick={onAddClick}
									size='lg'
									className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 transition-all duration-200'>
									<Sparkles className='w-5 h-5 mr-2' />
									{addButtonLabel || 'Create Your First Plan'}
									<ArrowRight className='ml-2 h-5 w-5' />
								</Button>
							</motion.div>
						)}
					</div>
				</motion.div>

				{/* Right Side Container */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className='flex-[0.4] flex flex-col gap-4'>
					{/* Learn More Card */}
					<motion.div
						onClick={() => window.open(learnMoreUrl, '_blank')}
						className='flex-1 bg-[#0B1121] rounded-[20px] p-8 relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300'>
						<div className='absolute inset-0'>
							<div className='absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 via-[#B114FF]/20 to-[#3B82F6]/20 group-hover:opacity-75 transition-opacity duration-300'></div>
						</div>
						<div className='relative z-10'>
							<span className='inline-flex items-center text-[#4ADE80] text-sm font-medium mb-3 px-3 py-1 bg-[#4ADE80]/10 rounded-full'>
								<BookOpen className='w-4 h-4 mr-2' />
								Learn More
							</span>
							<h2 className='text-xl font-semibold text-white tracking-tight mb-3'>How to get started with Flexprice</h2>
							<p className='text-slate-300 text-sm leading-relaxed'>Get your billing started in 5 minutes!</p>
							<div className='mt-4 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors duration-200'>
								<span className='text-sm font-medium'>Read the guide</span>
								<ArrowRight className='w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200' />
							</div>
						</div>
					</motion.div>

					{/* Quick Action Card */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className='flex-1 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[20px] p-8 relative overflow-hidden border border-indigo-100/20'>
						<div className='relative z-10'>
							<span className='inline-flex items-center text-indigo-600 text-sm font-medium mb-3 px-3 py-1 bg-indigo-50 rounded-full'>
								<Rocket className='w-4 h-4 mr-2' />
								Quick Start
							</span>
							<motion.img
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								src={illustration}
								alt='Feature illustration'
								className='h-32 w-auto object-contain mb-4 transform group-hover:scale-105 transition-transform duration-300'
							/>
							<div className='space-y-3'>
								<div className='flex items-center text-slate-600 hover:text-indigo-600 transition-colors duration-200 cursor-pointer'>
									<ArrowRight className='w-4 h-4 mr-2' />
									<span className='text-sm'>View Documentation</span>
								</div>
								<div className='flex items-center text-slate-600 hover:text-indigo-600 transition-colors duration-200 cursor-pointer'>
									<ArrowRight className='w-4 h-4 mr-2' />
									<span className='text-sm'>Watch Tutorial</span>
								</div>
								<div className='flex items-center text-slate-600 hover:text-indigo-600 transition-colors duration-200 cursor-pointer'>
									<ArrowRight className='w-4 h-4 mr-2' />
									<span className='text-sm'>Join Community</span>
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>

			{/* Quick Start Section */}
			<ApiDocsContent tags={tags} />

			{tutorials.length > 0 && (
				<div>
					<h2 className='text-2xl font-semibold text-slate-900 mb-6'>Quick Start Guides</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
						{tutorials.map((tutorial) => (
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} key={tutorial.id}>
								<Card
									className='group bg-white border border-slate-100 rounded-lg p-6 hover:border-blue-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-500/5'
									onClick={tutorial.onClick}>
									<div className='flex gap-4'>
										<div className='flex-shrink-0 mt-1'>
											<AlignJustify className='w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors duration-200' />
										</div>

										<div className='flex-1 min-w-0'>
											<h3 className='text-slate-800 text-base font-medium mb-2 group-hover:text-blue-600 transition-colors duration-200'>
												{tutorial.title}
											</h3>
											<p className='text-slate-500 text-sm leading-relaxed'>{tutorial.description}</p>

											<div className='flex items-center gap-1 mt-4 text-slate-400 group-hover:text-blue-500 transition-all duration-200'>
												<span className='text-xs font-medium'>Learn more</span>
												<ArrowRight className='w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200' />
											</div>
										</div>
									</div>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			)}

			{isLoading && (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
					<Skeleton className='w-full h-32' />
					<Skeleton className='w-full h-32' />
					<Skeleton className='w-full h-32' />
				</div>
			)}
		</Page>
	);
};

export default EmptyPage;
