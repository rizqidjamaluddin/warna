import { useCallback } from 'react'

/**
 * Hook to disable/enable text selection globally during drag operations.
 * Returns functions to enable and disable selection.
 */
export function useDisableSelection() {
	const disableSelection = useCallback(() => {
		document.documentElement.classList.add('disable-selection')
	}, [])

	const enableSelection = useCallback(() => {
		document.documentElement.classList.remove('disable-selection')
	}, [])

	return { disableSelection, enableSelection }
}
