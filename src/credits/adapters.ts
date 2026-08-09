// src/credits/adapters.ts
//
// Pure DTO → presentational mapping for the credits widgets. No React, no hooks — independently
// unit-testable. Containers call these to turn API responses into the widgets' typed
// presentational models. Mirrors `src/usage/adapters.ts`.
import { WALLET_STATUS } from '@/models/Wallet';
import type { WalletResponse } from '@/types/dto/Wallet';
import type { RealtimeWalletBalance } from '@/models/WalletBalance';
import type { CreditBalanceData } from './types';

const STATUS_MAP: Record<WALLET_STATUS, CreditBalanceData['status']> = {
	[WALLET_STATUS.ACTIVE]: 'active',
	[WALLET_STATUS.FROZEN]: 'frozen',
	[WALLET_STATUS.CLOSED]: 'closed',
};

/** Prefers the realtime balance query's values over the wallet list snapshot, matching the old widget's precedence. */
export function adaptCreditBalance(wallet: WalletResponse, realtime?: RealtimeWalletBalance): CreditBalanceData {
	return {
		id: wallet.id,
		name: wallet.name,
		status: STATUS_MAP[wallet.wallet_status] ?? 'active',
		creditBalance: Number(realtime?.credit_balance ?? wallet.credit_balance ?? 0),
		balance: Number(realtime?.balance ?? wallet.balance ?? 0),
		currency: realtime?.currency || wallet.currency || 'USD',
	};
}
