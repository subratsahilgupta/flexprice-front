import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import UsageBreakdown from './UsageBreakdown';

const ROWS = [
	{ id: 'feat_1', name: 'API Calls', groupId: 'grp_1', groupName: 'Core', totalUsage: 1000, totalCost: 12, currency: 'USD' },
	{ id: 'feat_2', name: 'Storage', totalUsage: 50, totalCost: 0 },
];

describe('UsageBreakdown', () => {
	it('renders grouped and ungrouped rows with the title', () => {
		render(<UsageBreakdown rows={ROWS} />);
		expect(screen.getByText('Usage Breakdown')).toBeInTheDocument();
		expect(screen.getByText('Core')).toBeInTheDocument();
		expect(screen.getByText('Storage')).toBeInTheDocument();
	});

	it('renders nothing when not loading and rows is empty', () => {
		const { container } = render(<UsageBreakdown rows={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders a loading skeleton when isLoading', () => {
		const { container } = render(<UsageBreakdown rows={[]} isLoading />);
		expect(container.querySelector('.animate-pulse')).not.toBeNull();
	});

	it('renders a non-numeric totalUsageDisplay as-is instead of "NaN"', () => {
		render(<UsageBreakdown rows={[{ id: 'feat_1', name: 'API Calls', totalUsage: 0, totalCost: 0, totalUsageDisplay: 'N/A' }]} />);
		expect(screen.getByText('N/A')).toBeInTheDocument();
		expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
	});

	it('exposes aria-expanded and a focus-visible ring on an expandable group header row', () => {
		render(<UsageBreakdown rows={ROWS} />);
		const groupRow = screen.getByText('Core').closest('[role="button"]');
		expect(groupRow).toHaveAttribute('aria-expanded');
		expect(groupRow?.className).toContain('focus-visible:ring-2');
		expect(groupRow?.className).not.toContain('focus:outline-none');
	});
});
