import { Page, Card, AddButton } from '@/components/atoms';
import { FC, ReactNode } from 'react';
import { AlignJustify, ArrowRight } from 'lucide-react';
import { ApiDocsContent } from '@/components/molecules/ApiDocs/ApiDocs';
import { TutorialItem } from '@/pages/onboarding/onboarding';
import { motion } from 'framer-motion';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';

interface Props {
	onAddClick?: () => void;
	tags?: string[];
	heading?: string;
	children?: ReactNode;
	tutorials?: TutorialItem[];
}

const EmptyPage: FC<Props> = ({ onAddClick, tags, heading, children, tutorials = [] }) => {
	return (
		<Page
			heading={heading}
			headingCTA={
				onAddClick && (
					<AddButton
						onClick={() => {
							if (onAddClick) {
								onAddClick();
								refetchQueries();
							}
						}}
					/>
				)
			}>
			{children}
			{/* Quick Start Section */}
			<ApiDocsContent tags={tags} />

			{tutorials.length > 0 && (
				<div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
						{tutorials.map((tutorial, index) => (
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} key={index}>
								<Card
									className='h-full group bg-white border border-slate-100 rounded-lg p-6 shadow-sm hover:border-blue-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-500/5'
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

			{/* {tutorials.length === 0 && (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
					<Skeleton className='w-full h-32' />
					<Skeleton className='w-full h-32' />
					<Skeleton className='w-full h-32' />
				</div>
			)} */}
		</Page>
	);
};

export default EmptyPage;
