//
// Public presentational types for the credits widgets (balance, history).
//
// Decoupled from backend DTOs (WalletResponse / RealtimeWalletBalance / WalletTransaction).
// Containers map API responses INTO these shapes via `adapters.ts`, so backend schema changes
// never leak into the widgets' public contract.

// ── CreditBalance ────────────────────────────────────────────────────────────

export interface CreditBalanceData {
	id: string;
	name: string;
	status: 'active' | 'frozen' | 'closed';
	creditBalance: number;
	balance: number;
	currency: string;
}

export interface CreditBalanceProps {
	/** null renders the empty state (no wallet set up). */
	wallet: CreditBalanceData | null;
	isLoading?: boolean;
	className?: string;
}
