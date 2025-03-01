import { cn } from '@/lib/utils';

interface PageProps {
	children: React.ReactNode;
	className?: string;
	type?: 'left-aligned' | 'default';
}

const Page = ({ children, className, type = 'default' }: PageProps) => {
	return (
		<div
			className={cn('min-h-screen page  ', type === 'left-aligned' && 'px-6', type === 'default' && 'mx-auto max-w-screen-lg', className)}>
			{children}
		</div>
	);
};

export default Page;
