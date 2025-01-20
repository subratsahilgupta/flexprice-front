import useQueryParams from '@/hooks/useQueryParams';
import React, { FC, useEffect, useState } from 'react';

interface Tab {
	id: string;
	label: string;
	component: React.ReactNode;
}

interface TabbarProps {
	tabs: Tab[];
	initialActiveTab?: string;
}

const Tabbar: FC<TabbarProps> = ({ tabs, initialActiveTab }) => {
	const { queryParams, setQueryParam } = useQueryParams<{ activeTab?: string }>({ activeTab: tabs[0]?.id });
	const initialTabFromQuery = queryParams.activeTab || initialActiveTab || tabs[0]?.id;
	const [activeTab, setActiveTab] = useState<string>(initialTabFromQuery);

	useEffect(() => {
		if (queryParams.activeTab && queryParams.activeTab !== activeTab) {
			setActiveTab(queryParams.activeTab);
		}
	}, [queryParams.activeTab]);

	useEffect(() => {
		// Ensure query parameter matches a valid tab
		if (queryParams.activeTab && !tabs.some((tab) => tab.id === queryParams.activeTab)) {
			setQueryParam('activeTab', tabs[0]?.id);
			setActiveTab(tabs[0]?.id);
		}
	}, [queryParams.activeTab, tabs]);

	const onTabChange = (tabId: string) => {
		setActiveTab(tabId);
		setQueryParam('activeTab', tabId); // Update query parameter
	};

	return (
		<div>
			{/* Tab Navigation */}
			<div className='border-b border-border'>
				<nav className='flex space-x-4' aria-label='Tabs'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none
                                ${
																	activeTab === tab.id
																		? 'text-primary border-b-2 border-primary'
																		: 'text-muted-foreground hover:text-foreground hover:border-muted'
																}
                            `}
							role='tab'
							aria-selected={activeTab === tab.id}>
							{tab.label}
							{activeTab === tab.id && <span className='absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded' aria-hidden='true' />}
						</button>
					))}
				</nav>
			</div>

			{/* Active Tab Content */}
			<div className='mt-4'>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
		</div>
	);
};

export default Tabbar;
