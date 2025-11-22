import { motion } from 'motion/react'
import type { FormEvent, ReactNode } from 'react'

interface PromptProps<T> {
	isOpen: boolean
	title: string
	onSubmit: (data: T) => void | Promise<void>
	onCancel: () => void
	children: ReactNode
	submitLabel?: string
	cancelLabel?: string
	isSubmitting?: boolean
}

export function Prompt<T>({
	isOpen,
	title,
	onSubmit,
	onCancel,
	children,
	submitLabel = 'Save',
	cancelLabel = 'Cancel',
	isSubmitting = false,
}: PromptProps<T>) {
	if (!isOpen) return null

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const data = Object.fromEntries(formData.entries()) as T
		await onSubmit(data)
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.15 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
			style={{ zIndex: 200 }}
			onClick={onCancel}
		>
			<motion.div
				initial={{ scale: 0.95, opacity: 0, y: 20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 20 }}
				transition={{ duration: 0.2, ease: 'easeOut' }}
				className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					{children}
					<div className="flex gap-3 justify-end pt-2">
						<button
							type="button"
							onClick={onCancel}
							disabled={isSubmitting}
							className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
						>
							{cancelLabel}
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
						>
							{isSubmitting ? 'Saving...' : submitLabel}
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	)
}
