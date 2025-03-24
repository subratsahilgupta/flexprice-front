import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabItem {
	value: string;
	label: string;
	content: React.ReactNode;
}

interface CustomTabsProps {
	tabs: TabItem[];
	defaultValue?: string;
	className?: string;
}

export const CustomTabs = ({ tabs, defaultValue = tabs[0]?.value, className }: CustomTabsProps) => {
	return (
		<Tabs defaultValue={defaultValue} className={cn('w-full', className)}>
			<TabsList className='px-4 space-x-6 bg-transparent'>
				{tabs.map((tab) => (
					<TabsTrigger
						key={tab.value}
						value={tab.value}
						className={cn(
							'text-[15px] font-normal text-gray-500 px-3 py-1 rounded-md',
							'data-[state=active]:text-gray-900 data-[state=active]:bg-[#F9FAFB]',
							'hover:text-gray-900 transition-colors',
							'bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
						)}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			<div>
				{tabs.map((tab) => (
					<TabsContent key={tab.value} value={tab.value}>
						{tab.content}
					</TabsContent>
				))}
			</div>
		</Tabs>
	);
};
