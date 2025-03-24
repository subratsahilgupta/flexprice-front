import { create } from 'zustand';

export interface CodeSnippet {
	label: string;
	description?: string;
	curl: string;
}

interface ApiDocsState {
	docsUrl: string;
	snippets: CodeSnippet[];
	setDocs: (docsUrl: string, snippets: CodeSnippet[]) => void;
	clearDocs: () => void;
}

export const useApiDocsStore = create<ApiDocsState>((set) => ({
	docsUrl: '',
	snippets: [],
	setDocs: (docsUrl, snippets) => {
		// Only update if values are different
		set((state) => {
			if (state.docsUrl === docsUrl && state.snippets === snippets) {
				return state;
			}
			return { docsUrl, snippets };
		});
	},
	clearDocs: () => set({ docsUrl: '', snippets: [] }),
}));
