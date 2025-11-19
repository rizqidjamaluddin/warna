/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { vi } from 'vitest'

// Simple IndexedDB mock for testing
export function mockIndexedDB() {
	const store = new Map<string, any>()

	function createRequest(resultValue: any) {
		const request = {
			onerror: null as any,
			onsuccess: null as any,
			result: resultValue,
			error: null,
		}

		// Trigger onsuccess asynchronously
		queueMicrotask(() => {
			if (request.onsuccess) {
				request.onsuccess()
			}
		})

		return request
	}

	const mockDB = {
		objectStoreNames: {
			contains: () => false,
		},
		createObjectStore: vi.fn((_name: string, _options: any) => ({
			createIndex: vi.fn(),
		})),
		transaction: vi.fn((_stores: string[], _mode: string) => ({
			objectStore: vi.fn(() => ({
				put: vi.fn((value: any) => {
					store.set(value.metadata.id, value)
					return createRequest(undefined)
				}),
				get: vi.fn((key: string) => {
					return createRequest(store.get(key))
				}),
				getAll: vi.fn(() => {
					return createRequest(Array.from(store.values()))
				}),
				delete: vi.fn((key: string) => {
					store.delete(key)
					return createRequest(undefined)
				}),
			})),
		})),
	}

	const mockIndexedDB = {
		open: vi.fn((_name: string, _version: number) => {
			const request = {
				onerror: null as any,
				onsuccess: null as any,
				onupgradeneeded: null as any,
				result: mockDB,
				error: null,
			}

			// Simulate async open
			queueMicrotask(() => {
				if (request.onupgradeneeded) {
					request.onupgradeneeded({ target: { result: mockDB } } as any)
				}
				if (request.onsuccess) {
					request.onsuccess()
				}
			})

			return request
		}),
	}
	;(globalThis as any).indexedDB = mockIndexedDB as any

	return { store, mockDB, mockIndexedDB }
}
