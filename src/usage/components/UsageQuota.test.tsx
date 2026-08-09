import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import UsageQuota from './UsageQuota';

describe('UsageQuota', () => {
	it('renders a row per item with usage / limit text', () => {
		render(
			<UsageQuota
				items={[
					{ id: 'f1', name: 'API Calls', currentUsage: 250, limit: 1000, isUnlimited: false },
					{ id: 'f2', name: 'Storage', currentUsage: 42, limit: null, isUnlimited: true },
				]}
			/>,
		);
		expect(screen.getByText('API Calls')).toBeInTheDocument();
		expect(screen.getByText('Storage')).toBeInTheDocument();
		expect(screen.getByText('Usage Quota')).toBeInTheDocument();
	});

	it('renders nothing for an empty item list', () => {
		const { container } = render(<UsageQuota items={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('honors a custom label', () => {
		render(<UsageQuota items={[{ id: 'f1', name: 'X', currentUsage: 1, limit: null, isUnlimited: true }]} label='My Usage' />);
		expect(screen.getByText('My Usage')).toBeInTheDocument();
	});
});
