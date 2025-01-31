import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

export const useBreadcrumbStore = create<BreadcrumbState>()(
	devtools((set, get) => ({
		breadcrumbs: [],
		breadcrumbCache: {},

		setBreadcrumbs: (breadcrumbs, forceChange = false) => {
			if (typeof window !== 'undefined') {
				const pathKey = window.location.pathname;
				const { breadcrumbCache } = get();

				const cachedBreadcrumbs = breadcrumbCache[pathKey];

				// Only update if cache is missing or forced to change
				if (cachedBreadcrumbs && !forceChange) {
					console.log(`Using cached breadcrumbs for ${pathKey}:`, cachedBreadcrumbs);
					set({ breadcrumbs: cachedBreadcrumbs });
				} else {
					console.log(`Setting new breadcrumbs for ${pathKey}:`, breadcrumbs);
					set({
						breadcrumbs,
						breadcrumbCache: {
							...breadcrumbCache,
							[pathKey]: breadcrumbs,
						},
					});
				}
			}
		},

		resetBreadcrumbs: () => set({ breadcrumbs: [] }),
	})),
);
