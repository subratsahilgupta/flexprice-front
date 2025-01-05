import React, { FC, useState } from 'react';

interface Tab {
	id: string;
	label: string;
	component: React.ReactNode;
}

interface TabbarProps {
	tabs: Tab[];
	initialActiveTab?: string; // Optional: Allows setting an initial active tab
}

const Tabbar: FC<TabbarProps> = ({ tabs, initialActiveTab }) => {
	// State to track the currently active tab
	const [activeTab, setActiveTab] = useState<string>(initialActiveTab || tabs[0]?.id);

	// Function to handle tab change
	const onTabChange = (tabId: string) => {
		setActiveTab(tabId);
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
                            `}>
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
