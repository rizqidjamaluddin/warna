import { Menubar } from 'radix-ui'
import type { ReactNode } from 'react'

interface MenuItemProps {
	onSelect?: () => void
	disabled?: boolean
	children: ReactNode
}

export function MenuItem({ onSelect, disabled = false, children }: MenuItemProps) {
	return (
		<Menubar.Item
			className={`text-sm px-3 py-2 rounded select-none outline-none ${
				disabled
					? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
					: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
			}`}
			onSelect={disabled ? undefined : onSelect}
			disabled={disabled}
		>
			{children}
		</Menubar.Item>
	)
}
