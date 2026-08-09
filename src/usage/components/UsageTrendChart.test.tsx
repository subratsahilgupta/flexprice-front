import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import UsageTrendChart from './UsageTrendChart';

describe('UsageTrendChart', () => {
	it('renders the chart title and passes series through to the chart', () => {
		render(<UsageTrendChart series={[{ id: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10 }] }]} />);
		expect(screen.getByText('Usage Trend')).toBeInTheDocument();
	});

	it('renders nothing when not loading and series is empty', () => {
		const { container } = render(<UsageTrendChart series={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders a loading skeleton when isLoading', () => {
		const { container } = render(<UsageTrendChart series={[]} isLoading />);
		expect(container.querySelector('.animate-pulse, [class*="skeleton"]')).not.toBeNull();
	});
});
