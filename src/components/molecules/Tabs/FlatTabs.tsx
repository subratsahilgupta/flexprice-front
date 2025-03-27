import { cn } from '@/lib/utils';
import { FC, useState } from 'react';

interface TabItem {
	value: string;
	label: string;
	content: React.ReactNode;
}

interface FlatTabsProps {
	tabs: TabItem[];
	defaultValue?: string;
	className?: string;
}

const FlatTabs: FC<FlatTabsProps> = ({ tabs, defaultValue = tabs[0]?.value, className }) => {
	const [activeTab, setActiveTab] = useState(defaultValue);

	const onTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	return (
		<div defaultValue={defaultValue} className={cn('w-full', className)}>
			<div className=' space-x-3 bg-transparent'>
				<div className='border-b border-border mt-4 mb-6'>
					<nav className='flex space-x-4' aria-label='Tabs'>
						{tabs.map((tab) => (
							<button
								key={tab.value}
								onClick={() => onTabChange(tab.value)}
								className={cn(
									'px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none',
									activeTab === tab.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
								)}
								role='tab'
								aria-selected={activeTab === tab.value}>
								{tab.label}
							</button>
						))}
					</nav>
				</div>
			</div>
			<div className='mt-4'>
				<div className='mt-0 p-0' key={activeTab}>
					{tabs.find((tab) => tab.value === activeTab)?.content}
				</div>
			</div>
		</div>
	);
};
export default FlatTabs;
