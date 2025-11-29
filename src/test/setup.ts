import '@testing-library/jest-dom/vitest'
import { mockIndexedDB } from './mocks/indexedDB'

// Set up IndexedDB mock for all tests
mockIndexedDB()

// Mock ResizeObserver for all tests
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
global.ResizeObserver = class ResizeObserver {
	observe() {
		// Mock implementation
	}
	unobserve() {
		// Mock implementation
	}
	disconnect() {
		// Mock implementation
	}
}
