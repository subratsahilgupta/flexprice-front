import { cn } from '@/lib/utils';

interface PageProps {
	children: React.ReactNode;
	className?: string;
}

const Page = ({ children, className }: PageProps) => {
	return <div className={cn('min-h-screen page max-w-screen-lg mx-auto', className)}>{children}</div>;
};

export default Page;
