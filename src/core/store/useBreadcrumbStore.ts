import { create } from 'zustand';

interface BreadcrumbItem {
	label: string;
	path: string;
}

interface BreadcrumbState {
	breadcrumbs: BreadcrumbItem[];
	breadcrumbCache: Record<string, BreadcrumbItem[]>;
	setBreadcrumbs: (breadcrumbs: BreadcrumbItem[], forceChange?: boolean) => void;
	resetBreadcrumbs: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set, get) => ({
	breadcrumbs: [],
	breadcrumbCache: {},

	setBreadcrumbs: (breadcrumbs, forceChange = false) => {
		if (typeof window !== 'undefined') {
			const pathKey = window.location.pathname;
			const { breadcrumbCache } = get();

			// Check if cached breadcrumbs exist for the current path
			const cachedBreadcrumbs = breadcrumbCache[pathKey];

			// If cached breadcrumbs exist, simply use them
			if (cachedBreadcrumbs && !forceChange) {
				set({
					breadcrumbs: cachedBreadcrumbs,
				});
				console.log(`Using cached breadcrumbs for ${pathKey}:`, cachedBreadcrumbs, cachedBreadcrumbs?.length);
			} else {
				set({
					breadcrumbs,
					breadcrumbCache: {
						...breadcrumbCache,
						[pathKey]: breadcrumbs,
					},
				});
				console.log(`Setting new breadcrumbs for ${pathKey}:`, breadcrumbs, cachedBreadcrumbs?.length);
			}
		}
	},

	resetBreadcrumbs: () => set({ breadcrumbs: [] }),
}));
