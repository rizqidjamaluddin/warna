import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement } from 'react'

/**
 * Custom render function that wraps components with providers if needed
 */
export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>,
) {
	return render(ui, { ...options })
}

// Re-export everything from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
