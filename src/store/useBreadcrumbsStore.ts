import { create } from 'zustand';

export interface BreadcrumbItem {
	label: string;
	path: string;
	isLoading?: boolean;
}

interface BreadcrumbsState {
	breadcrumbs: BreadcrumbItem[];
	isLoading: boolean;
	setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
	updateBreadcrumb: (pathOrIndex: string | number, newLabel: string) => void;
	setLoading: (loading: boolean) => void;
	setSegmentLoading: (pathOrIndex: string | number, isLoading: boolean) => void;
	clearBreadcrumbs: () => void;
	removeBreadcrumb: (pathOrIndex: string | number) => void;
}

export const useBreadcrumbsStore = create<BreadcrumbsState>((set) => ({
	breadcrumbs: [],
	isLoading: false,
	setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
	updateBreadcrumb: (pathOrIndex, newLabel) =>
		set((state) => ({
			breadcrumbs: state.breadcrumbs.map((crumb, index) => {
				if (typeof pathOrIndex === 'string' && crumb.path === pathOrIndex) {
					return { ...crumb, label: newLabel, isLoading: false };
				}
				if (typeof pathOrIndex === 'number' && index === pathOrIndex) {
					return { ...crumb, label: newLabel, isLoading: false };
				}
				return crumb;
			}),
		})),
	setLoading: (loading) => set({ isLoading: loading }),
	setSegmentLoading: (pathOrIndex, isLoading) =>
		set((state) => ({
			breadcrumbs: state.breadcrumbs.map((crumb, index) => {
				if (typeof pathOrIndex === 'string' && crumb.path === pathOrIndex) {
					return { ...crumb, isLoading };
				}
				if (typeof pathOrIndex === 'number' && index === pathOrIndex) {
					return { ...crumb, isLoading };
				}
				return crumb;
			}),
		})),
	clearBreadcrumbs: () => set({ breadcrumbs: [] }),
	removeBreadcrumb: (pathOrIndex) =>
		set((state) => ({
			breadcrumbs: state.breadcrumbs.filter((_, index) => index !== pathOrIndex),
		})),
}));
