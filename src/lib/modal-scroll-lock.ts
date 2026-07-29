/**
 * Shared ownership count for the Dialog/Sheet scroll-lock safety net (see Dialog.tsx / Sheet.tsx).
 *
 * Radix's own scroll lock (react-remove-scroll) can leave document.body's overflow/pointer-events
 * stuck when a Dialog or Sheet closes while nested near another modal or popover. Each atom clears
 * that stuck state after closing, but must only do so once every other open overlay has also
 * closed — otherwise it can rip the lock out from under a dialog that's still legitimately open.
 *
 * React guarantees a `useEffect` cleanup runs before unmount or before the effect re-runs, so this
 * count is always accurate at the moment it's read — independent of whatever internal timing issue
 * caused Radix's own cleanup to be skipped in the first place.
 */
let openCount = 0;

export function registerModalOpen(): () => void {
	openCount += 1;
	return () => {
		openCount = Math.max(0, openCount - 1);
	};
}

export function hasRegisteredOpenModals(): boolean {
	return openCount > 0;
}
