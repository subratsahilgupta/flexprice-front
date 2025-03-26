import { Page, Button, Card } from '@/components/atoms';
import { FC, ReactNode, useEffect, useState } from 'react';
import { AlignJustify, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ApiDocsContent, fetchApidocsJson } from '@/components/molecules/ApiDocs/ApiDocs';
import { fetchAndExtractSnippetsByTags } from '@/components/molecules/ApiDocs/fetch_api_docs';
import { TutorialItem } from '@/pages/onboarding/onboarding';
import { Skeleton } from '@/components/ui/skeleton';
interface Props {
	children?: ReactNode;
	title?: string;
	description?: string;
	onAddClick?: () => void;
	tags?: string[];
	addButtonLabel?: string;
}

const EmptyPage: FC<Props> = ({
	// children,
	// title,
	// description,
	onAddClick,
	tags,
	addButtonLabel,
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
			const tutorials: TutorialItem[] = snippets.map((snippet) => {
				return {
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
				};
			});
			setTutorials(tutorials);
		};
		if (tags) {
			fetchSnippets(tags);
		}
	}, [tags, docs]);

	return (
		<Page>
			{/* api docs */}
			<div className='w-full flex gap-6 mb-16'>
				{/* Welcome Container */}
				<div className='flex-1 rounded-[20px] bg-[#dde1eb] p-8'>
					<div className='flex w-full items-start justify-between'>
						<div className='w-[60%]'>
							<h1 className='text-xl font-semibold tracking-tight mb-2'>Welcome to Flexprice!</h1>
							<p className='text-slate-800 text-sm mb-6'>Let's get your pricing and billing started!</p>
							{onAddClick && <Button onClick={onAddClick}>{addButtonLabel || 'Add'}</Button>}
						</div>
						<div className='flex-shrink-0 ml-8 w-[40%]'>
							<img src='/assets/svg/onboarding_hero.svg' alt='Onboarding Hero' className='h-auto' />
						</div>
					</div>
				</div>

				{/* Learn More Container */}
				<div
					onClick={() => {
						window.open(' https://docs.flexprice.io/guides/self-hosted/guide', '_blank');
					}}
					className='flex-1 bg-[#0B1121] rounded-[20px] p-8 relative overflow-hidden'>
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
			<ApiDocsContent tags={tags} />

			<div>
				<h2 className='text-2xl font-semibold text-slate-900 mb-6'>Quick Start</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
					{tutorials.map((tutorial) => (
						<Card
							key={tutorial.id}
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
				{isLoading && (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
						<Skeleton className='w-full h-32' />
						<Skeleton className='w-full h-32' />
						<Skeleton className='w-full h-32' />
						<Skeleton className='w-full h-32' />
						<Skeleton className='w-full h-32' />
						<Skeleton className='w-full h-32' />
					</div>
				)}
			</div>
		</Page>
	);
};

export default EmptyPage;
