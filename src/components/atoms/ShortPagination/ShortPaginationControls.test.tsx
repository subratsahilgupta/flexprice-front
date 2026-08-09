// src/components/atoms/ShortPagination/ShortPaginationControls.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import enCommon from '@/i18n/locales/en/common.json';
import { ShortPaginationControls } from './ShortPaginationControls';

describe('ShortPaginationControls', () => {
	it('renders real translated pagination text through a host i18next instance (regression test for the router-leak/i18n-bundling fix)', () => {
		const instance = createInstance();
		instance.init({ lng: 'en', fallbackLng: 'en', ns: ['common'], defaultNS: 'common', resources: { en: { common: enCommon } } });
		render(
			<I18nextProvider i18n={instance}>
				<ShortPaginationControls page={1} pageSize={10} totalItems={25} onPageChange={vi.fn()} unit='items' />
			</I18nextProvider>,
		);
		// Must resolve through the HOST's real common.json — not the bundled fallback text, and never a raw key.
		expect(screen.getByText('Showing 1 to 10 of 25 items')).toBeInTheDocument();
		expect(screen.queryByText('pagination.showingRange')).not.toBeInTheDocument();
	});

	it('renders the bundled English default when no host i18next instance is present', () => {
		render(<ShortPaginationControls page={1} pageSize={10} totalItems={25} onPageChange={vi.fn()} unit='items' />);
		expect(screen.getByText('Showing 1 to 10 of 25 items')).toBeInTheDocument();
	});
});
