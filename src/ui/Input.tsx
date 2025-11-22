import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{label}
				</label>
			)}
			<input
				className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
				{...props}
			/>
		</div>
	)
}
