export interface Tab {
	id: string
	label: string
	content: React.ReactNode
}

interface TabsProps {
	tabs: Tab[]
	activeTabId: string
	onActiveTabChange: (tabId: string) => void
	className?: string
}

/**
 * Reusable controlled tabs component
 * Displays a tab bar with content area below
 */
export function Tabs({ tabs, activeTabId, onActiveTabChange, className = '' }: TabsProps) {
	const activeTab = tabs.find((tab) => tab.id === activeTabId)

	if (tabs.length === 0) {
		return null
	}

	return (
		<div className={`flex flex-col h-full ${className}`}>
			{/* Tab bar */}
			<div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => onActiveTabChange(tab.id)}
						className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
							activeTabId === tab.id
								? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
								: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab content */}
			<div className="flex-1 overflow-auto">
				{activeTab?.content}
			</div>
		</div>
	)
}
