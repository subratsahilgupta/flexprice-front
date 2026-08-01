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
	let released = false;
	return () => {
		if (released) return;
		released = true;
		openCount = Math.max(0, openCount - 1);
	};
}

export function hasRegisteredOpenModals(): boolean {
	return openCount > 0;
}

/**
 * DOM-level fallback used alongside the counter above: catches overlays that don't (or can't)
 * call registerModalOpen — e.g. a Radix AlertDialog (role="alertdialog", not "dialog") or a
 * Popover/Select dropdown portaled outside any Dialog/Sheet. Extend this selector, not the call
 * sites, when a new overlay type needs to participate in the safety net.
 */
const OPEN_OVERLAY_SELECTOR = '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-radix-popper-content-wrapper]';

export function hasOpenOverlayInDom(): boolean {
	return !!document.querySelector(OPEN_OVERLAY_SELECTOR);
}
